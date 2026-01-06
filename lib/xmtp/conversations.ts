import type { Client, Group } from "@xmtp/browser-sdk";
import type { ContentTypes } from "./client";

export async function createGroupWithAgentAddresses(
  client: Client<ContentTypes>,
  addresses: string[],
): Promise<Group> {
  if (!addresses || addresses.length === 0) {
    throw new Error("No addresses provided for group creation");
  }

  const identifiers = addresses.map((address) => ({
    identifier: address.toLowerCase(),
    identifierKind: "Ethereum" as const,
  }));

  const group = await client.conversations.newGroupWithIdentifiers(
    identifiers,
    {
      name: "Agent Group",
    },
  );

  return group;
}
