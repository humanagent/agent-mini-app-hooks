import type { Client } from "@xmtp/browser-sdk";
import type { HDNodeWallet } from "ethers";
import { createEOASigner } from "./signer";

export async function createXMTPClient(wallet: HDNodeWallet): Promise<Client> {
  if (typeof window === "undefined") {
    throw new Error("XMTP client can only be created in browser environment");
  }

  console.log("[XMTP] Starting client creation...");
  console.log("[XMTP] Wallet address:", wallet.address);

  const signer = createEOASigner(wallet);
  console.log("[XMTP] Signer created");

  try {
    console.log("[XMTP] Dynamically importing Client...");
    const { Client } = await import("@xmtp/browser-sdk");
    
    console.log("[XMTP] Calling Client.create...");
    const client = await Client.create(signer as any, {
      env: "production",
      loggingLevel: "info",
    });
    
    console.log("[XMTP] Client created successfully!");
    console.log("[XMTP] Inbox ID:", client.inboxId);
    return client;
  } catch (error) {
    console.error("[XMTP] Client creation failed:", error);
    console.error("[XMTP] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

