import { ConversationView } from "@components/message-list/index";
import { Sidebar } from "@components/sidebar/sidebar";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { SidebarInset, SidebarProvider, useSidebar } from "@ui/sidebar";
import { ConversationsProvider } from "@/src/contexts/xmtp-conversations-context";
import { BrowserRouter, Routes, Route } from "react-router";
import { ExplorePage } from "@components/explore/index";
import { useSwipeGesture } from "@hooks/use-swipe-gesture";
import { useRef } from "react";

function SidebarInsetWithSwipe() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const touchStartRef = useRef<{ x: number; time: number } | null>(null);
  const SWIPE_THRESHOLD = 50;
  const EDGE_THRESHOLD = 20;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX <= EDGE_THRESHOLD && !openMobile) {
      touchStartRef.current = { x: touch.clientX, time: Date.now() };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    if (deltaX > SWIPE_THRESHOLD && isMobile && !openMobile) {
      setOpenMobile(true);
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeRight: () => {
      if (isMobile && !openMobile) {
        setOpenMobile(true);
      }
    },
    minSwipeDistance: 50,
  });

  const combinedHandlers = isMobile
    ? {
        onTouchStart: (e: React.TouchEvent) => {
          handleTouchStart(e);
          swipeHandlers.onTouchStart(e);
        },
        onTouchMove: (e: React.TouchEvent) => {
          handleTouchMove(e);
          swipeHandlers.onTouchMove(e);
        },
        onTouchEnd: () => {
          handleTouchEnd();
          swipeHandlers.onTouchEnd();
        },
      }
    : {};

  return (
    <SidebarInset {...combinedHandlers}>
      <Routes>
        <Route path="/explore" element={<ExplorePage />} />
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
      <ConversationsProvider client={client}>
        <AppContent />
      </ConversationsProvider>
    </BrowserRouter>
  );
}
