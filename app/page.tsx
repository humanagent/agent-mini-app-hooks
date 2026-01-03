"use client";

import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { ChatArea } from "../components/chat-area";
import { Sidebar } from "../components/sidebar";
import { useXMTPClient } from "../hooks/use-xmtp-client";
import { useXMTPConversations } from "../hooks/use-xmtp-conversations";

export default function Home() {
  const { client, isLoading: clientLoading, error: clientError } = useXMTPClient();
  const { conversations, isLoading: conversationsLoading, error: conversationsError } = useXMTPConversations(client);

  if (clientError) {
    console.error("[Home] XMTP Client error:", clientError);
  }
  if (conversationsError) {
    console.error("[Home] XMTP Conversations error:", conversationsError);
  }

  if (client && conversations.length > 0) {
    console.log("[Home] XMTP initialized:", {
      clientInboxId: client.inboxId,
      conversationsCount: conversations.length,
      conversations: conversations.map((c) => ({ id: c.id, type: c.constructor.name })),
    });
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar />
      <SidebarInset>
        <ChatArea />
      </SidebarInset>
    </SidebarProvider>
  );
}

