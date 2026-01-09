import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { FloatingNavButton } from "@components/sidebar/floating-nav-button";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { SidebarInset, SidebarProvider, useSidebar } from "@ui/sidebar";
import { ConversationsProvider } from "@/src/contexts/xmtp-conversations-context";
import { ToastProvider } from "@ui/toast";
import { BrowserRouter, Routes, Route } from "react-router";
import { ExplorePage } from "@components/explore/index";
import { AnalyticsPage } from "@components/analytics/index";
import { DevPortalPage } from "@components/dev-portal/index";
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
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/dev-portal" element={<DevPortalPage />} />
        <Route
          path="/conversation/:conversationId"
          element={<ConversationView />}
        />
        <Route path="/" element={<ConversationView />} />
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
      <ToastProvider>
        <ConversationsProvider client={client}>
          <AppContent />
        </ConversationsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
