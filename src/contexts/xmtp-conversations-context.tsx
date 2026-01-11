import type { Client } from "@xmtp/browser-sdk";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useXMTPConversations } from "@/src/components/sidebar/use-xmtp-conversations";
import type { ContentTypes } from "@/lib/xmtp/client";
import type { AgentConfig } from "@/agent-registry/agents";

type PendingConversationStatus = "creating" | "sending";

type ConversationsContextType = ReturnType<typeof useXMTPConversations> & {
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
  const conversationsData = useXMTPConversations(client);
  const [pendingConversation, setPendingConversation] = useState<{
    agentAddresses: string[];
    agentConfigs: AgentConfig[];
    autoMessage?: string;
    status?: PendingConversationStatus;
  } | null>(null);

  const value: ConversationsContextType = {
    ...conversationsData,
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
