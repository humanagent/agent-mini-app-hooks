import type { Permission } from "./types";

const TOKEN_ADDRESSES: Record<string, { address: string; chain: "Worldchain" | "Base" | "Ethereum" }> = {
  USDC: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    chain: "Base",
  },
  ETH: {
    address: "0x0000000000000000000000000000000000000000",
    chain: "Ethereum",
  },
  WETH: {
    address: "0x4200000000000000000000000000000000000006",
    chain: "Base",
  },
};

function getRandomDate(): Date {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * 90);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  return new Date(
    now - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000,
  );
}

function generateRandomAllowance(token: "USDC" | "ETH" | "WETH", seed: number): string {
  const rng = (seed * 17 + 23) % 1000;
  if (token === "USDC") {
    const amount = Math.floor((rng / 1000) * 99000) + 1000;
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (token === "ETH") {
    const amount = ((rng / 1000) * 9 + 1);
    return amount.toFixed(4);
  }
  const amount = ((rng / 1000) * 9 + 1);
  return amount.toFixed(4);
}

function getAddressSeed(address: string): number {
  return parseInt(address.slice(2, 10), 16) || 0;
}

export function generateMockPermissions(agentAddress: string): Permission[] {
  const addressSeed = getAddressSeed(agentAddress);
  const tokens: Array<"USDC" | "ETH" | "WETH"> = ["USDC", "ETH", "WETH"];
  const permissions: Permission[] = [];

  tokens.forEach((token, index) => {
    const tokenInfo = TOKEN_ADDRESSES[token];
    if (!tokenInfo) return;

    const seed = addressSeed + index * 7;
    permissions.push({
      id: `perm-${agentAddress.slice(2, 10)}-${index}`,
      token,
      tokenAddress: tokenInfo.address,
      allowance: generateRandomAllowance(token, seed),
      spender: agentAddress.toLowerCase(),
      grantedAt: getRandomDate(),
      chain: tokenInfo.chain,
    });
  });

  return permissions.sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());
}
