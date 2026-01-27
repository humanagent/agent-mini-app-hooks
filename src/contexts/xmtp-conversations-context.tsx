import { createContext, useContext, useState, type ReactNode } from "react";
import { useConversations } from "@xmtp/use-conversations";
import type { Client, Conversation } from "@xmtp/browser-sdk";
import type { ContentTypes } from "@xmtp/utils";
import type { AgentConfig } from "@xmtp/agents";

type PendingConversationStatus = "creating" | "sending";

type ConversationsContextType = {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  isLoading: boolean;
  error: Error | null;
  refreshConversations: () => Promise<void>;
  pendingConversation: {
    agentAddresses: string[];
    agentConfigs: AgentConfig[];
    autoMessage?: string;
    status?: PendingConversationStatus;
  } | null;
  setPendingConversation: (
    pending: {
      agentAddresses: string[];
      agentConfigs: AgentConfig[];
      autoMessage?: string;
      status?: PendingConversationStatus;
    } | null,
  ) => void;
};

const ConversationsContext = createContext<ConversationsContextType | null>(
  null,
);

export function ConversationsProvider({
  client,
  children,
}: {
  client: Client<ContentTypes> | null;
  children: ReactNode;
}) {
  const { conversations, isLoading, error, refresh } = useConversations(client);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [pendingConversation, setPendingConversation] = useState<{
    agentAddresses: string[];
    agentConfigs: AgentConfig[];
    autoMessage?: string;
    status?: PendingConversationStatus;
  } | null>(null);

  const value: ConversationsContextType = {
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    error,
    refreshConversations: refresh,
    pendingConversation,
    setPendingConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversationsContext() {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error(
      "useConversationsContext must be used within ConversationsProvider",
    );
  }
  return context;
}
