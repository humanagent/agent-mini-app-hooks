import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { FloatingNavButton } from "@components/sidebar/floating-nav-button";
import { useClient } from "@xmtp/hooks/use-client";
import { SidebarInset, SidebarProvider, useSidebar } from "@ui/sidebar";
import { ConversationsProvider } from "@/src/contexts/xmtp-conversations-context";
import { ToastProvider } from "@ui/toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useSwipeGesture } from "@hooks/use-swipe-gesture";

function SidebarInsetWithSwipe() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (isMobile && !openMobile) {
        setOpenMobile(true);
      }
    },
    minSwipeDistance: 50,
  });

  const combinedHandlers = isMobile ? swipeHandlers : {};

  return (
    <SidebarInset {...combinedHandlers}>
      <Routes>
        <Route path="/" element={<ConversationView />} />
        <Route path="/chat" element={<ConversationView />} />
        <Route
          path="/conversation/:conversationId"
          element={<ConversationView />}
        />
        <Route path="/explore" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SidebarInset>
  );
}

function AppContent() {
  return (
    <SidebarProvider>
      <FloatingNavButton />
      <Sidebar />
      <SidebarInsetWithSwipe />
    </SidebarProvider>
  );
}

export default function App() {
  const { client } = useClient();

  return (
    <BrowserRouter>
      <ToastProvider>
        <ConversationsProvider client={client}>
          <AppContent />
        </ConversationsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
