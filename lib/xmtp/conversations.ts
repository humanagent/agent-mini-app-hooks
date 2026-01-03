import type { Client, Group } from "@xmtp/browser-sdk";

export async function createGroupWithAgentAddresses(
  client: Client,
  addresses: string[],
): Promise<Group> {
  if (!addresses || addresses.length === 0) {
    throw new Error("No addresses provided for group creation");
  }

  const identifiers = addresses.map((address) => ({
    identifier: address.toLowerCase(),
    identifierKind: "Ethereum" as const,
  }));

  try {
    const group = await client.conversations.newGroupWithIdentifiers(
      identifiers,
      {
        name: "Agent Group",
      },
    );

    return group;
  } catch (error) {
    console.error(
      "[createGroupWithAgentAddresses] Error creating group",
      error,
    );
    throw error;
  }
}
