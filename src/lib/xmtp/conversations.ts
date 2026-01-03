import type { Client, Dm } from "@xmtp/browser-sdk";

export async function findOrCreateDmWithAddress(
  client: Client,
  address: string,
): Promise<Dm> {
  try {
    const existingDm = await client.conversations.newDm(address.toLowerCase());
    return existingDm;
  } catch (error) {
    console.error("[findOrCreateDmWithAddress] Error:", error);
    throw error;
  }
}
