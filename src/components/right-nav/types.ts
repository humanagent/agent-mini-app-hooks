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
