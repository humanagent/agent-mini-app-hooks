import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { ExploreIcon, MessageIcon, AnalyticsIcon } from "@ui/icons";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarUI,
  useSidebar,
} from "@ui/sidebar";
import { useToast } from "@ui/toast";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { SidebarUserNav } from "@/src/components/sidebar/user-nav";
import { ConversationItem } from "@/src/components/sidebar/conversation-item";
import type { Conversation } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { denyConversation } from "@/lib/xmtp/consent";
import {
  sortConversationsByLastMessage,
  type ConversationWithMeta,
} from "@/src/components/sidebar/utils";
import { cn } from "@/lib/utils";

const SidebarLogo = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => (
  <img
    src="/icon.svg"
    alt="XMTP Agents"
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    }}
    role="button"
    tabIndex={0}
    className={cn(
      "size-10 rounded p-2 hover:bg-zinc-800 transition-colors duration-200 cursor-pointer",
      className,
    )}
  />
);

export function Sidebar() {
  const { client } = useXMTPClient();
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    refreshConversations,
    setPendingConversation,
  } = useConversationsContext();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const [sortedConversations, setSortedConversations] = useState<
    ConversationWithMeta[]
  >([]);

  useEffect(() => {
    if (conversations.length === 0) {
      setSortedConversations([]);
      return;
    }

    let isCancelled = false;

    void sortConversationsByLastMessage(conversations).then((sorted) => {
      if (!isCancelled) {
        setSortedConversations(sorted);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [conversations]);

  const handleDeleteConversation = useCallback(
    async (conversation: Conversation, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!client) {
        showToast(
          "Unable to delete conversation. Client not available.",
          "error",
        );
        return;
      }

      try {
        await denyConversation(conversation, client);

        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(null);
        }

        await refreshConversations();
        showToast("Conversation deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting conversation:", error);
        showToast("Failed to delete conversation. Please try again.", "error");
      }
    },
    [
      client,
      selectedConversation,
      setSelectedConversation,
      refreshConversations,
      showToast,
    ],
  );

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    navigate(`/conversation/${conversation.id}`);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogoClick = useCallback(() => {
    console.log("[Sidebar] Logo clicked, navigating to app route");
    navigate("/", { replace: true });
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [navigate, isMobile, setOpenMobile]);

  return (
    <SidebarUI className="group-data-[side=left]:border-r-0" collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
            <SidebarLogo
              className="group-data-[collapsible=icon]:hidden"
              onClick={handleLogoClick}
            />
            <SidebarToggle />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={
                location.pathname === "/" || location.pathname === "/explore"
              }
              tooltip="Browse"
            >
              <Link
                to="/"
                onClick={() => {
                  setSelectedConversation(null);
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <ExploreIcon size={16} />
                <span className="group-data-[collapsible=icon]:hidden">
                  Browse
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Chats"
              isActive={
                location.pathname === "/chat" ||
                location.pathname.startsWith("/conversation/")
              }
              onClick={() => {
                setSelectedConversation(null);
                setPendingConversation(null);
                navigate("/chat", { replace: true });
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <MessageIcon size={16} />
              <span className="group-data-[collapsible=icon]:hidden">
                Chats
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/analytics"}
              tooltip="Analytics"
            >
              <Link to="/analytics">
                <AnalyticsIcon size={16} />
                <span className="group-data-[collapsible=icon]:hidden">
                  Analytics
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {!sortedConversations || sortedConversations.length === 0 ? (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              Your conversations will appear here once you start chatting!
            </div>
          ) : (
            sortedConversations.map(({ conversation, lastMessagePreview }) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={
                  selectedConversation?.id === conversation.id &&
                  location.pathname.startsWith("/conversation/")
                }
                lastMessagePreview={lastMessagePreview}
                onClick={() => {
                  handleConversationClick(conversation);
                }}
                onDelete={(e) => {
                  void handleDeleteConversation(conversation, e);
                }}
              />
            ))
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:p-0">
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <SidebarLogo onClick={handleLogoClick} />
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarUserNav />
        </div>
      </SidebarFooter>
    </SidebarUI>
  );
}
