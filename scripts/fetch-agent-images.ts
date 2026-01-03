import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENS_RESOLVER_ABI = [
  "function resolver(bytes32 node) external view returns (address)",
  "function name(bytes32 node) external view returns (string)",
] as const;

const PUBLIC_RESOLVER_ABI = [
  "function text(bytes32 node, string calldata key) external view returns (string)",
] as const;

const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const MAINNET_RPC = process.env.ETH_RPC_URL || "https://ethereum.publicnode.com";
const WEB3_BIO_API_KEY = process.env.WEB3_BIO_API_KEY;

type Web3BioProfile = {
  address: string;
  identity: string;
  platform: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  location?: string;
  header?: string;
  contenthash?: string;
  links?: Record<string, { link?: string; handle?: string; sources?: string[] }>;
  social?: {
    uid?: number | string | null;
    follower?: number;
    following?: number;
  };
};

type AgentInfo = {
  name: string;
  address: string;
  block: string;
  start: number;
  end: number;
};

type Update = {
  agent: AgentInfo;
  image: string | null;
  domain: string | null;
};

async function getEnsName(
  address: string,
  provider: ethers.JsonRpcProvider,
): Promise<string | null> {
  try {
    const registry = new ethers.Contract(ENS_REGISTRY, ENS_RESOLVER_ABI, provider);
    const namehash = ethers.namehash(`${address.slice(2)}.addr.reverse`);
    const resolverAddress = await registry.resolver(namehash);

    if (resolverAddress === ethers.ZeroAddress) {
      return null;
    }

    const resolver = new ethers.Contract(resolverAddress, ENS_RESOLVER_ABI, provider);
    const name = await resolver.name(namehash);
    return name || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Failed to resolve ENS name for ${address}:`, message);
    return null;
  }
}

function convertIpfsToGateway(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return uri;
}

async function getEnsAvatar(
  name: string,
  provider: ethers.JsonRpcProvider,
): Promise<string | null> {
  if (!name) return null;

  try {
    const registry = new ethers.Contract(ENS_REGISTRY, ENS_RESOLVER_ABI, provider);
    const namehash = ethers.namehash(name);
    const resolverAddress = await registry.resolver(namehash);

    if (resolverAddress === ethers.ZeroAddress) {
      return null;
    }

    const resolver = new ethers.Contract(resolverAddress, PUBLIC_RESOLVER_ABI, provider);
    const avatar = await resolver.text(namehash, "avatar");

    if (!avatar || avatar === "") {
      return null;
    }

    return convertIpfsToGateway(avatar);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Failed to get avatar for ${name}:`, message);
    return null;
  }
}

async function getWeb3BioProfiles(address: string): Promise<Web3BioProfile[]> {
  if (!WEB3_BIO_API_KEY) {
    console.log("  ⚠ WEB3_BIO_API_KEY not set, skipping web3.bio lookup");
    return [];
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (WEB3_BIO_API_KEY) {
      headers["X-API-KEY"] = `Bearer ${WEB3_BIO_API_KEY}`;
    }

    const response = await fetch(
      `https://api.web3.bio/profile/${address.toLowerCase()}`,
      { headers },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const profiles = (await response.json()) as Web3BioProfile[];
    return Array.isArray(profiles) ? profiles : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ✗ web3.bio lookup failed: ${message}`);
    return [];
  }
}

function parseAgents(content: string): AgentInfo[] {
  const agents: AgentInfo[] = [];
  const arrayStart = content.indexOf("export const AI_AGENTS: AgentConfig[] = [");
  if (arrayStart === -1) {
    throw new Error("Could not find AI_AGENTS array");
  }

  let pos = arrayStart + "export const AI_AGENTS: AgentConfig[] = [".length;
  let depth = 1;
  let currentAgentStart = -1;
  let braceDepth = 0;
  let inString = false;
  let stringChar: string | null = null;

  while (pos < content.length && depth > 0) {
    const char = content[pos];
    const prevChar = pos > 0 ? content[pos - 1] : "";

    if (!inString) {
      if (char === "{" && prevChar !== "\\") {
        if (braceDepth === 0) {
          currentAgentStart = pos;
        }
        braceDepth++;
      } else if (char === "}" && prevChar !== "\\") {
        braceDepth--;
        if (braceDepth === 0 && currentAgentStart !== -1) {
          const agentBlock = content.substring(currentAgentStart, pos + 1);
          const nameMatch = agentBlock.match(/name:\s*"([^"]+)"/);
          const addressMatch = agentBlock.match(/address:\s*"([^"]+)"/);

          if (nameMatch && addressMatch) {
            agents.push({
              name: nameMatch[1],
              address: addressMatch[1],
              block: agentBlock,
              start: currentAgentStart,
              end: pos + 1,
            });
          }
          currentAgentStart = -1;
        }
      } else if (char === "[" && prevChar !== "\\") {
        depth++;
      } else if (char === "]" && prevChar !== "\\") {
        depth--;
      } else if ((char === '"' || char === "'") && prevChar !== "\\") {
        inString = true;
        stringChar = char;
      }
    } else {
      if (char === stringChar && prevChar !== "\\") {
        inString = false;
        stringChar = null;
      }
    }
    pos++;
  }

  return agents;
}

async function fetchAgentImages() {
  const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
  const agentsPath = join(process.cwd(), "lib", "agents.ts");
  let content = readFileSync(agentsPath, "utf-8");

  const agents = parseAgents(content);
  console.log(`Found ${agents.length} agents`);
  console.log("Fetching ENS avatars...\n");

  const updates: Update[] = [];
  for (const agent of agents) {
    console.log(`Processing ${agent.address}...`);

    let image: string | null = null;
    let domain: string | null = null;

    const reverseName = await getEnsName(agent.address, provider);
    if (reverseName) {
      domain = reverseName;
      console.log(`  ✓ Resolved primary ENS: ${reverseName}`);
      image = await getEnsAvatar(reverseName, provider);
      if (image) {
        console.log(`  ✓ Found ENS avatar: ${image}`);
      } else {
        console.log(`  ✗ No ENS avatar set`);
      }
    } else {
      console.log(`  ✗ No primary ENS name found`);
    }

    const web3BioProfiles = await getWeb3BioProfiles(agent.address);
    if (web3BioProfiles.length > 0) {
      const preferredPlatforms = ["ens", "farcaster", "lens", "basenames"];
      const sortedProfiles = web3BioProfiles.sort((a, b) => {
        const aIndex = preferredPlatforms.indexOf(a.platform) !== -1
          ? preferredPlatforms.indexOf(a.platform)
          : 999;
        const bIndex = preferredPlatforms.indexOf(b.platform) !== -1
          ? preferredPlatforms.indexOf(b.platform)
          : 999;
        return aIndex - bIndex;
      });

      for (const profile of sortedProfiles) {
        if (profile.identity && !domain) {
          domain = profile.identity;
          console.log(`  ✓ Found web3.bio identity (${profile.platform}): ${domain}`);
          break;
        }
      }

      for (const profile of sortedProfiles) {
        if (profile.avatar && !image) {
          image = profile.avatar;
          console.log(`  ✓ Found web3.bio avatar (${profile.platform}): ${image}`);
          break;
        }
      }
    }

    updates.push({ agent, image, domain });
  }

  let offset = 0;
  for (const { agent, image, domain } of updates.reverse()) {
    const startPos = agent.start + offset;
    const endPos = agent.end + offset;
    const currentBlock = content.substring(startPos, endPos);

    let updatedBlock = currentBlock;

    const fieldsToUpdate: Array<{ key: string; value: string }> = [];
    if (image !== null) {
      fieldsToUpdate.push({ key: "image", value: image });
    }
    if (domain !== null) {
      fieldsToUpdate.push({ key: "domain", value: domain });
    }

    for (const field of fieldsToUpdate) {
      if (updatedBlock.includes(`${field.key}:`)) {
        updatedBlock = updatedBlock.replace(
          new RegExp(`${field.key}:\\s*"[^"]*"`, "g"),
          `${field.key}: "${field.value}"`,
        );
      }
    }

    const fieldsToAdd = fieldsToUpdate.filter(
      (field) => !updatedBlock.includes(`${field.key}:`),
    );

    if (fieldsToAdd.length > 0) {
      const lines = updatedBlock.split("\n");
      const lastContentLineIndex = lines.findLastIndex(
        (line) => line.trim() && !line.trim().startsWith("}"),
      );

      if (lastContentLineIndex !== -1) {
        const lastLine = lines[lastContentLineIndex];
        const indentMatch = lastLine.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "";
        const trimmedLast = lastLine.trimEnd();
        lines[lastContentLineIndex] = trimmedLast.endsWith(",")
          ? trimmedLast
          : trimmedLast + ",";

        for (const field of fieldsToAdd) {
          lines.splice(
            lastContentLineIndex + 1,
            0,
            `${indent}${field.key}: "${field.value}"`,
          );
        }
        updatedBlock = lines.join("\n");
      }
    }

    for (const field of ["image", "domain"]) {
      if (!fieldsToUpdate.some((f) => f.key === field)) {
        updatedBlock = updatedBlock.replace(
          new RegExp(`\\s+${field}:\\s*"[^"]*",?\\n?`, "g"),
          "",
        );
      }
    }

    const before = content.substring(0, startPos);
    const after = content.substring(endPos);
    content = before + updatedBlock + after;

    offset += updatedBlock.length - currentBlock.length;
  }

  writeFileSync(agentsPath, content, "utf-8");
  console.log("\n✓ Updated agents.ts with image URLs");
}

fetchAgentImages().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
