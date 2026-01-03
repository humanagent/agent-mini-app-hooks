import type { Client, Group } from "@xmtp/browser-sdk";

export async function createGroupWithAgentAddresses(
  client: Client,
  addresses: string[],
): Promise<Group> {
  console.log("[createGroupWithAgentAddresses] Called", {
    addressesCount: addresses.length,
    addresses,
    clientInboxId: client.inboxId,
  });

  if (!addresses || addresses.length === 0) {
    throw new Error("No addresses provided for group creation");
  }

  const identifiers = addresses.map((address) => ({
    identifier: address.toLowerCase(),
    identifierKind: "Ethereum" as const,
  }));

  console.log(
    "[createGroupWithAgentAddresses] Creating group with identifiers",
    {
      identifiersCount: identifiers.length,
      identifiers,
    },
  );

  try {
    const group = await client.conversations.newGroupWithIdentifiers(
      identifiers,
      {
        name: "Agent Group",
      },
    );

    console.log("[createGroupWithAgentAddresses] Group created successfully", {
      groupId: group.id,
      groupName: group.name,
    });

    return group;
  } catch (error) {
    console.error(
      "[createGroupWithAgentAddresses] Error creating group",
      error,
    );
    throw error;
  }
}
