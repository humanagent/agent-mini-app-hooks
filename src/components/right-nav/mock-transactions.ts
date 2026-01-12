import type { Transaction } from "./types";

function generateRandomHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generateRandomAmount(): string {
  const amount = Math.floor(Math.random() * 9900) + 100;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getRandomDate(): Date {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  return new Date(
    now - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000,
  );
}

export function generateMockTransactions(
  memberAddresses: string[],
  count: number = 15,
): Transaction[] {
  if (memberAddresses.length < 2) {
    return [];
  }

  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const fromIndex = Math.floor(Math.random() * memberAddresses.length);
    let toIndex = Math.floor(Math.random() * memberAddresses.length);
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * memberAddresses.length);
    }

    transactions.push({
      id: `tx-${i}`,
      hash: generateRandomHash(),
      from: memberAddresses[fromIndex]!,
      to: memberAddresses[toIndex]!,
      amount: generateRandomAmount(),
      timestamp: getRandomDate(),
      status: "success",
      token: "USDC",
      chain: "Worldchain",
    });
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
