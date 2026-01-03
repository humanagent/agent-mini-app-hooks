import { ChatArea } from "@components/chat-area/index";
import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { SidebarInset, SidebarProvider } from "@ui/sidebar";
import {
  ConversationsProvider,
  useConversationsContext,
} from "@/src/contexts/xmtp-conversations-context";

function AppContent() {
  const { selectedConversation } = useConversationsContext();

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        {selectedConversation ? <ConversationView /> : <ChatArea />}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  const { client, isLoading, error } = useXMTPClient();

  console.log("[App] XMTP client state - isLoading:", isLoading, "hasClient:", !!client, "hasError:", !!error);

  return (
    <ConversationsProvider client={client}>
      <AppContent />
    </ConversationsProvider>
  );
}
