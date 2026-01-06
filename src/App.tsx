import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { SidebarInset, SidebarProvider } from "@ui/sidebar";
import { ConversationsProvider } from "@/src/contexts/xmtp-conversations-context";
import { BrowserRouter, Routes, Route } from "react-router";
import { ExplorePage } from "@components/explore/index";

function AppContent() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Routes>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/" element={<ConversationView />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  const { client, isLoading, error } = useXMTPClient();

  console.log(
    "[XMTP] App - client:",
    client ? "exists" : "null",
    "isLoading:",
    isLoading,
    "error:",
    error?.message,
  );

  return (
    <BrowserRouter>
      <ConversationsProvider client={client}>
        <AppContent />
      </ConversationsProvider>
    </BrowserRouter>
  );
}
