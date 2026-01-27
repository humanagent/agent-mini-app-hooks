// Core hooks (5 total)
export { useAgentClient } from "./use-agent-client";
export { useAgentConversations } from "./use-agent-conversations";
export { useAgentConversation } from "./use-agent-conversation";
export { useAgentConversationAgents } from "./use-agent-conversation-agents";
export { useAgentSelection } from "./use-agent-selection";

// Types from hooks
export type { Message } from "./use-agent-conversation";
export type { AgentConfig } from "@/src/agents";

// XMTP types (re-exported for components)
export type {
  Client,
  Conversation,
  Group,
  DecodedMessage,
  GroupMember,
} from "@xmtp/browser-sdk";

// Re-export Group class for instanceof checks
export { Group } from "@xmtp/browser-sdk";

// ContentTypes from utils
export type { ContentTypes } from "./utils";
