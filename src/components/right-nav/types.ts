export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: Date;
  status: "success" | "pending" | "failed";
  token: "USDC";
  chain: "Worldchain";
}

export interface Permission {
  id: string;
  token: "USDC" | "ETH" | "WETH";
  tokenAddress: string;
  allowance: string;
  spender: string;
  grantedAt: Date;
  chain: "Worldchain" | "Base" | "Ethereum";
}
