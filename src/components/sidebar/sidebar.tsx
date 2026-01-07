import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { ExploreIcon, PlusIcon } from "@ui/icons";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarUI,
} from "@ui/sidebar";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { SidebarUserNav } from "@/src/components/sidebar/user-nav";
import { ConversationItem } from "@/src/components/sidebar/conversation-item";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group, Dm, ConsentState, ConsentEntityType } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { getGroupConsentState } from "@/lib/xmtp/consent";
import { sortConversationsByLastMessage } from "@/src/components/sidebar/utils";
import { cn } from "@/lib/utils";

const SidebarLogo = ({ className }: { className?: string }) => (
  <img
    src="/icon.svg"
    alt="XMTP Agents"
    className={cn("size-8 rounded-md p-2 hover:bg-sidebar-accent", className)}
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
  const location = useLocation();
  const navigate = useNavigate();
  const [sortedConversations, setSortedConversations] = useState<
    Conversation[]
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
        return;
      }

      try {
        if (conversation instanceof Group) {
          const currentState = await getGroupConsentState(conversation);
          const newState =
            currentState === ConsentState.Allowed
              ? ConsentState.Denied
              : ConsentState.Allowed;
          await client.preferences.setConsentStates([
            {
              entity: conversation.id,
              entityType: ConsentEntityType.GroupId,
              state: newState,
            },
          ]);
        } else if (conversation instanceof Dm) {
          await client.preferences.setConsentStates([
            {
              entity: conversation.id,
              entityType: ConsentEntityType.ConversationId,
              state: ConsentState.Denied,
            },
          ]);
        }

        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(null);
        }

        await refreshConversations();
      } catch {
        // Silently fail - conversation state unchanged
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
  };

  return (
    <SidebarUI className="group-data-[side=left]:border-r-0" collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
            <SidebarLogo className="group-data-[collapsible=icon]:hidden" />
            <SidebarToggle />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Chat"
              onClick={() => {
                setSelectedConversation(null);
                setPendingConversation(null);
                navigate("/", { replace: true });
              }}
            >
              <PlusIcon size={16} />
              <span className="group-data-[collapsible=icon]:hidden">
                New Chat
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/explore"}
              tooltip="Explore"
            >
              <Link to="/explore">
                <ExploreIcon size={16} />
                <span className="group-data-[collapsible=icon]:hidden">
                  Explore
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {!sortedConversations || sortedConversations.length === 0 ? (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 py-2 text-sm text-muted-foreground">
              Your conversations will appear here once you start chatting!
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={selectedConversation?.id === conversation.id}
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
          <SidebarLogo />
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarUserNav />
        </div>
      </SidebarFooter>
    </SidebarUI>
  );
}
