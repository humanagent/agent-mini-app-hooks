import type { AgentConfig } from "@/src/agents";
import type { Conversation } from "@xmtp/browser-sdk";

export function useInputAreaModes({
  selectedAgents,
  setSelectedAgents,
  conversation,
}: {
  selectedAgents?: AgentConfig[];
  setSelectedAgents?: (agents: AgentConfig[]) => void;
  conversation?: Conversation | null;
}) {
  // Determine context mode:
  // Chat Area Mode: selectedAgents provided AND conversation is null/undefined (conversation not started)
  // Message List Mode: conversation provided AND selectedAgents not provided (conversation ongoing)
  const isChatAreaMode =
    selectedAgents !== undefined && setSelectedAgents !== undefined;
  const isMessageListMode =
    conversation !== undefined && selectedAgents === undefined;

  // Multi-agent mode: use props (for chat area)
  // Single-agent mode: use internal state (for message list)
  const isMultiAgentMode = isChatAreaMode;

  return {
    isChatAreaMode,
    isMessageListMode,
    isMultiAgentMode,
  };
}
