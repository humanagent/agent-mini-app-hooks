import { Client } from "@xmtp/browser-sdk";
import type { Dm } from "@xmtp/browser-sdk";

export async function findOrCreateDmWithAddress(
  client: Client,
  agentAddress: string
): Promise<Dm> {
  console.log("[XMTP] Finding or creating DM with address:", agentAddress);

  try {
    const inboxId = await client.findInboxIdByIdentifier({
      identifier: agentAddress.toLowerCase(),
      identifierKind: "Ethereum",
    });

    if (!inboxId) {
      throw new Error(`Address ${agentAddress} is not registered on XMTP`);
    }

    console.log("[XMTP] Found inbox ID:", inboxId);

    const existingDm = await client.conversations.getDmByInboxId(inboxId);
    if (existingDm) {
      console.log("[XMTP] Found existing DM:", existingDm.id);
      return existingDm;
    }

    console.log("[XMTP] Creating new DM...");
    const newDm = await client.conversations.newDmWithIdentifier({
      identifier: agentAddress.toLowerCase(),
      identifierKind: "Ethereum",
    });

    console.log("[XMTP] Created new DM:", newDm.id);
    return newDm;
  } catch (error) {
    console.error("[XMTP] Failed to find or create DM:", error);
    throw error;
  }
}

