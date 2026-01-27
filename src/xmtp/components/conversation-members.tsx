import { useConversationMembers } from "../hooks/use-conversation-members";
import { matchAgentsFromMembers } from "../utils";
import type { Client } from "@xmtp/browser-sdk";
import type { ContentTypes } from "../utils";
import type { AgentConfig } from "@/src/agents";

type ConversationMembersProps = {
  conversationId: string | null | undefined;
  client: Client<ContentTypes> | null;
  agentList?: AgentConfig[];
  children?: (props: {
    members: ReturnType<typeof useConversationMembers>["members"];
    agents: AgentConfig[];
    isLoading: boolean;
    error: Error | null;
  }) => React.ReactNode;
};

/**
 * Encapsulates useConversationMembers hook with optional agent matching
 * Returns members and matched agents if agentList is provided
 */
export function ConversationMembers({
  conversationId,
  client,
  agentList,
  children,
}: ConversationMembersProps) {
  const { members, isLoading, error } = useConversationMembers(
    conversationId,
    client,
  );

  const agents = agentList ? matchAgentsFromMembers(members, agentList) : [];

  if (children) {
    return <>{children({ members, agents, isLoading, error })}</>;
  }

  return null;
}
