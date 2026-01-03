import type { Client } from "@xmtp/browser-sdk";
import { createContext, useContext, type ReactNode } from "react";
import { useXMTPConversations } from "@hooks/use-xmtp-conversations";

type ConversationsContextType = ReturnType<typeof useXMTPConversations>;

const ConversationsContext = createContext<ConversationsContextType | null>(
  null,
);

export function ConversationsProvider({
  client,
  children,
}: {
  client: Client | null;
  children: ReactNode;
}) {
  console.log("[ConversationsProvider] Rendering with client:", !!client);
  const value = useXMTPConversations(client);
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
