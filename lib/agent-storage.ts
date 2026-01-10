import type { AgentConfig } from "@/agent-registry/agents";

const STORAGE_KEY = "xmtp_dev_portal_agents";

const HARDCODED_AGENTS: AgentConfig[] = [
  {
    name: "gm",
    address: "0x194c31cae1418d5256e8c58e0d08aee1046c6ed0",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "Friendly greeting and conversation starter",
    suggestions: [
      "@gm Good morning! How can I help?",
      "@gm Start a conversation",
      "@gm Get started with XMTP",
    ],
    domain: "hi.xmtp.eth",
    image:
      "https://ipfs.io/ipfs/QmaSZuaXfNUwhF7khaRxCwbhohBhRosVX1ZcGzmtcWnqav",
  },
  {
    name: "key-check",
    address: "0x235017975ed5F55e23a71979697Cd67DcAE614Fa",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "QA agent for testing and verification",
    suggestions: [
      "@key-check Check my API keys",
      "@key-check Verify my configuration",
      "@key-check Test my setup",
    ],
    domain: "key-check.eth",
    image: "https://euc.li/key-check.eth",
  },
];

function initializeHardcodedAgents(): void {
  if (typeof window === "undefined") {
    return;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(HARDCODED_AGENTS));
    return;
  }

  try {
    const storedAgents = JSON.parse(stored) as AgentConfig[];
    const hardcodedAddresses = new Set(
      HARDCODED_AGENTS.map((a) => a.address.toLowerCase()),
    );
    const hasHardcoded = storedAgents.some((a) =>
      hardcodedAddresses.has(a.address.toLowerCase()),
    );

    if (!hasHardcoded) {
      const merged = [...HARDCODED_AGENTS, ...storedAgents];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  } catch (error) {
    console.error("[AgentStorage] Error initializing hardcoded agents:", error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(HARDCODED_AGENTS));
  }
}

export function getUserAgents(): AgentConfig[] {
  if (typeof window === "undefined") {
    return HARDCODED_AGENTS;
  }

  initializeHardcodedAgents();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let storedAgents: AgentConfig[] = [];

    if (stored) {
      storedAgents = JSON.parse(stored) as AgentConfig[];
    }

    const hardcodedAddresses = new Set(
      HARDCODED_AGENTS.map((a) => a.address.toLowerCase()),
    );

    const filteredStored = storedAgents.filter(
      (a) => !hardcodedAddresses.has(a.address.toLowerCase()),
    );

    return [...HARDCODED_AGENTS, ...filteredStored];
  } catch (error) {
    console.error("[AgentStorage] Error reading agents:", error);
    return HARDCODED_AGENTS;
  }
}

export function saveUserAgent(agent: AgentConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  initializeHardcodedAgents();

  const hardcodedAddresses = new Set(
    HARDCODED_AGENTS.map((a) => a.address.toLowerCase()),
  );

  if (hardcodedAddresses.has(agent.address.toLowerCase())) {
    console.log("[AgentStorage] Cannot modify hardcoded agent:", agent.address);
    return;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...HARDCODED_AGENTS, agent]),
      );
      return;
    }

    const allAgents = JSON.parse(stored) as AgentConfig[];
    const userAgents = allAgents.filter(
      (a) => !hardcodedAddresses.has(a.address.toLowerCase()),
    );

    const existingIndex = userAgents.findIndex(
      (a) => a.address.toLowerCase() === agent.address.toLowerCase(),
    );

    if (existingIndex >= 0) {
      userAgents[existingIndex] = agent;
    } else {
      userAgents.push(agent);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...HARDCODED_AGENTS, ...userAgents]),
    );
  } catch (error) {
    console.error("[AgentStorage] Error saving agent:", error);
    throw error;
  }
}

export function deleteUserAgent(address: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const hardcodedAddresses = new Set(
    HARDCODED_AGENTS.map((a) => a.address.toLowerCase()),
  );

  if (hardcodedAddresses.has(address.toLowerCase())) {
    console.log("[AgentStorage] Cannot delete hardcoded agent:", address);
    return;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    const storedAgents = JSON.parse(stored) as AgentConfig[];
    const filtered = storedAgents.filter(
      (a) => a.address.toLowerCase() !== address.toLowerCase(),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[AgentStorage] Error deleting agent:", error);
    throw error;
  }
}

export function getUserAgentByAddress(address: string): AgentConfig | undefined {
  const agents = getUserAgents();
  return agents.find((a) => a.address.toLowerCase() === address.toLowerCase());
}
