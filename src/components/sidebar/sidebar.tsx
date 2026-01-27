import { useClient } from "@xmtp/use-client";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { PlusIcon } from "@ui/icons";
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
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { SidebarUserNav } from "@/src/components/sidebar/user-nav";
import { ConversationItem } from "@/src/components/sidebar/conversation-item";
import type { Conversation } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { denyConversation } from "@xmtp/utils";
import {
  sortConversationsByLastMessage,
  type ConversationWithMeta,
} from "@/src/components/sidebar/utils";
import { cn } from "@/src/utils";

const SidebarLogo = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => (
  <img
    src="/icon.svg"
    alt="Agent Mini App Hooks"
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
  const { client } = useClient();
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    refreshConversations,
    setPendingConversation,
  } = useConversationsContext();
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
        console.error("Unable to delete conversation. Client not available.");
        return;
      }

      try {
        await denyConversation(conversation, client);

        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(null);
        }

        await refreshConversations();
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    },
    [
      client,
      selectedConversation,
      setSelectedConversation,
      refreshConversations,
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
              tooltip="New Chat"
              isActive={
                location.pathname === "/" ||
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
              <PlusIcon size={16} />
              <span className="group-data-[collapsible=icon]:hidden">
                New Chat
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
