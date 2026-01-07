import type { Client } from "@xmtp/browser-sdk";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useXMTPConversations } from "@/src/components/sidebar/use-xmtp-conversations";
import type { ContentTypes } from "@/lib/xmtp/client";
import type { AgentConfig } from "@/agent-registry/agents";

type ConversationsContextType = ReturnType<typeof useXMTPConversations> & {
  pendingConversation: {
    agentAddresses: string[];
    agentConfigs: AgentConfig[];
  } | null;
  setPendingConversation: (
    pending: { agentAddresses: string[]; agentConfigs: AgentConfig[] } | null,
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
  console.log(
    "[XMTP] ConversationsProvider - client:",
    client ? "exists" : "null",
  );
  const conversationsData = useXMTPConversations(client);
  const [pendingConversation, setPendingConversation] = useState<{
    agentAddresses: string[];
    agentConfigs: AgentConfig[];
  } | null>(null);

  const value: ConversationsContextType = {
    ...conversationsData,
    pendingConversation,
    setPendingConversation,
  };

  console.log(
    "[XMTP] ConversationsProvider - conversations:",
    value.conversations.length,
    "isLoading:",
    value.isLoading,
    "error:",
    value.error?.message,
    "pendingConversation:",
    pendingConversation ? pendingConversation.agentAddresses.length : null,
  );
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
