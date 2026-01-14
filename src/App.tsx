import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { FloatingNavButton } from "@components/sidebar/floating-nav-button";
import { PortalSidebar } from "@/src/portal/sidebar";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { SidebarInset, SidebarProvider, useSidebar } from "@ui/sidebar";
import { ConversationsProvider } from "@/src/contexts/xmtp-conversations-context";
import { ToastProvider } from "@ui/toast";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { ExplorePage } from "@components/explore/index";
import { AnalyticsPage } from "@/src/portal/analytics/index";
import { PortalPage } from "@/src/portal/index";
import { HelpPage } from "@/src/portal/help";
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
        <Route path="/" element={<ExplorePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/chat" element={<ConversationView />} />
        <Route
          path="/conversation/:conversationId"
          element={<ConversationView />}
        />
      </Routes>
    </SidebarInset>
  );
}

function PortalSidebarInsetWithSwipe() {
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
        <Route path="/dev-portal" element={<PortalPage />} />
        <Route path="/dev-portal/help" element={<HelpPage />} />
        <Route path="/dev-portal/analytics" element={<AnalyticsPage />} />
      </Routes>
    </SidebarInset>
  );
}

function AppContent() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith("/dev-portal");

  if (isPortal) {
    return (
      <SidebarProvider>
        <FloatingNavButton />
        <PortalSidebar />
        <PortalSidebarInsetWithSwipe />
      </SidebarProvider>
    );
  }

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
