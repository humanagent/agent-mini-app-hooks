import type { Client, GroupMember } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import type { AgentConfig } from "@xmtp/agents";
import type { ContentTypes } from "@xmtp/utils";
import { extractMemberAddresses } from "@xmtp/utils";

/**
 * Matches group members against an agent list
 * Returns agents whose addresses match member addresses
 */
export function matchAgentsFromMembers(
  members: GroupMember[],
  agentList: AgentConfig[],
): AgentConfig[] {
  const memberAddresses = new Set(extractMemberAddresses(members));
  return agentList.filter((agent) =>
    memberAddresses.has(agent.address.toLowerCase()),
  );
}

/**
 * Creates a group conversation with agent addresses
 */
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
