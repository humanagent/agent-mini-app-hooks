import { ChatArea } from "@components/chat-area/index";
import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useXMTPConversations } from "@hooks/use-xmtp-conversations";
import { SidebarInset, SidebarProvider } from "@ui/sidebar";

export default function App() {
  const { client } = useXMTPClient();
  const { selectedConversation } = useXMTPConversations(client);

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        {selectedConversation ? <ConversationView /> : <ChatArea />}
      </SidebarInset>
    </SidebarProvider>
  );
}
