import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { ExploreIcon, TrashIcon } from "@ui/icons";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarUI,
} from "@ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group, Dm, ConsentState, ConsentEntityType } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import { shortAddress } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { getGroupConsentState } from "@/lib/xmtp/consent";

async function sortConversationsByLastMessage(
  conversations: Conversation[],
): Promise<Conversation[]> {
  console.log("[Sidebar] Sorting conversations by last message date");

  const conversationsWithDates = await Promise.all(
    conversations.map(async (conversation) => {
      try {
        const lastMessage = await conversation.lastMessage();
        const createdAt = conversation.createdAt;

        let sortTime = Date.now();

        if (lastMessage) {
          const message = lastMessage as { sentAt?: Date; sentAtNs?: bigint };
          if (message.sentAt) {
            sortTime = message.sentAt.getTime();
          } else if (message.sentAtNs) {
            sortTime = Number(message.sentAtNs) / 1_000_000;
          }
        } else if (createdAt) {
          sortTime = createdAt.getTime();
        }

        return {
          conversation,
          sortTime,
        };
      } catch (error) {
        console.error("[Sidebar] Error getting last message:", {
          id: conversation.id,
          error,
        });

        const createdAt = conversation.createdAt;
        return {
          conversation,
          sortTime: createdAt ? createdAt.getTime() : Date.now(),
        };
      }
    }),
  );

  const sorted = conversationsWithDates
    .sort((a, b) => b.sortTime - a.sortTime)
    .map((item) => item.conversation);

  console.log("[Sidebar] Sorted conversations:", {
    count: sorted.length,
    firstId: sorted[0]?.id,
    lastId: sorted[sorted.length - 1]?.id,
  });

  return sorted;
}

const ChevronUpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: "currentcolor", ...props.style }}
    viewBox="0 0 16 16"
    width={size}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M7.29289 4.29289C7.68342 3.90237 8.31658 3.90237 8.70711 4.29289L13.7071 9.29289C14.0976 9.68342 14.0976 10.3166 13.7071 10.7071C13.3166 11.0976 12.6834 11.0976 12.2929 10.7071L8 6.41421L3.70711 10.7071C3.31658 11.0976 2.68342 11.0976 2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L7.29289 4.29289Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const SidebarUserNav = () => {
  const { client } = useXMTPClient();
  const address = client?.accountIdentifier?.identifier;
  const displayAddress = address
    ? shortAddress(address.toLowerCase())
    : "Guest";
  const initial = address ? address.substring(2, 3).toUpperCase() : "G";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="user-nav-button"
            >
              <div className="flex aspect-square size-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xs font-semibold">{initial}</span>
              </div>
              <span
                className="flex-1 truncate text-left"
                data-testid="user-email"
              >
                {displayAddress}
              </span>
              <ChevronUpIcon className="ml-auto shrink-0" size={16} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width)"
            data-testid="user-nav-menu"
            side="top"
          >
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button className="w-full cursor-pointer" type="button">
                Login to your account
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export function Sidebar() {
  const { client } = useXMTPClient();
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    refreshConversations,
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
        console.log("[Sidebar] No client available for deny action");
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
          const peerInboxId = conversation.peerInboxId as unknown as string;
          if (peerInboxId) {
            await (client.preferences as any).deny(peerInboxId);
          }
        }

        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(null);
        }

        await refreshConversations();
      } catch (error) {
        console.error("[Sidebar] Error denying conversation:", {
          id: conversation.id,
          error,
        });
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
    <SidebarUI className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <span className="cursor-pointer rounded-md px-2 font-semibold text-lg hover:bg-muted">
              XMTP Agents
            </span>
            <SidebarToggle />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
              onClick={() => {
                setSelectedConversation(null);
                navigate("/");
              }}
            >
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/explore"}
              className="cursor-pointer"
            >
              <Link to="/explore" className="cursor-pointer">
                <ExploreIcon size={16} />
                <span>Explore</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {!sortedConversations || sortedConversations.length === 0 ? (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 py-2 text-sm text-muted-foreground">
              Your conversations will appear here once you start chatting!
            </div>
          ) : (
            sortedConversations.map((conversation) => {
              const isActive = selectedConversation?.id === conversation.id;
              const isGroup = conversation instanceof Group;
              const groupName = isGroup ? conversation.name : null;
              const displayId =
                conversation.id.length > 20
                  ? `${conversation.id.slice(0, 10)}...${conversation.id.slice(-6)}`
                  : conversation.id;
              const displayText =
                isGroup && groupName && groupName !== "Agent Group"
                  ? groupName
                  : displayId;
              const isNamed =
                isGroup && groupName && groupName !== "Agent Group";

              return (
                <SidebarMenuItem key={conversation.id}>
                  <div className="group/conversation relative flex w-full items-center">
                    <SidebarMenuButton
                      isActive={isActive}
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        handleConversationClick(conversation);
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={displayText}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className={`truncate text-xs ${isNamed ? "font-medium" : "font-mono"}`}
                        >
                          {displayText}
                        </motion.span>
                      </AnimatePresence>
                    </SidebarMenuButton>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover/conversation:opacity-100 h-6 w-6 p-0 ml-1 transition-opacity"
                      onClick={(e) => {
                        void handleDeleteConversation(conversation, e);
                      }}
                    >
                      <TrashIcon size={14} />
                    </Button>
                  </div>
                </SidebarMenuItem>
              );
            })
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserNav />
      </SidebarFooter>
    </SidebarUI>
  );
}
