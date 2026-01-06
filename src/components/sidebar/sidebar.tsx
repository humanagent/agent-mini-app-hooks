import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { ExploreIcon, PlusIcon, TrashIcon } from "@ui/icons";
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
import type { Conversation } from "@xmtp/browser-sdk";
import {
  Group,
  Dm,
  ConsentState,
  ConsentEntityType,
} from "@xmtp/browser-sdk";
import { useEffect, useState, useCallback } from "react";
import { shortAddress } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

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
  const [blockedInboxIds, setBlockedInboxIds] = useState<Set<string>>(
    new Set(),
  );
  const [blockedGroupIds, setBlockedGroupIds] = useState<Set<string>>(
    new Set(),
  );

  // Check if conversations are blocked on mount and when conversations change
  useEffect(() => {
    if (!client) return;

    const checkBlocked = async () => {
      const blocked = new Set<string>();
      const blockedGroups = new Set<string>();

      for (const conversation of conversations) {
        if (conversation instanceof Group) {
          try {
            // Check group consent state
            const groupConsentState = await conversation.consentState;
            if (groupConsentState === ConsentState.Denied) {
              blockedGroups.add(conversation.id);
              console.log(
                "[Sidebar] Group is blocked:",
                conversation.id,
              );
            }
          } catch (error) {
            console.error("[Sidebar] Error checking group consent state:", error);
          }
        } else if (conversation instanceof Dm) {
          // DM - check peer inbox ID
          const peerInboxId = conversation.peerInboxId as unknown as string;
          if (peerInboxId) {
            try {
              const isAllowed = await (
                client.preferences as any
              ).isAllowed(peerInboxId);
              if (!isAllowed) {
                blocked.add(peerInboxId);
                console.log("[Sidebar] DM is blocked:", peerInboxId);
              }
            } catch (error) {
              console.error("[Sidebar] Error checking peer inbox ID:", error);
            }
          }
        }
      }
      setBlockedInboxIds(blocked);
      setBlockedGroupIds(blockedGroups);
    };

    void checkBlocked();
  }, [client, conversations]);

  const handleDeleteConversation = useCallback(
    async (conversation: Conversation, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!client) return;

      try {
        console.log("[Sidebar] Deleting conversation:", conversation.id);

        if (conversation instanceof Group) {
          // Block the group using consent state
          const currentState = await conversation.consentState;
          await client.preferences.setConsentStates([
            {
              entity: conversation.id,
              entityType: ConsentEntityType.GroupId,
              state:
                currentState === ConsentState.Allowed
                  ? ConsentState.Denied
                  : ConsentState.Allowed,
            },
          ]);
          console.log("[Sidebar] Blocked group:", conversation.id);
        } else if (conversation instanceof Dm) {
          // DM - block the peer
          const peerInboxId = conversation.peerInboxId as unknown as string;
          if (peerInboxId) {
            await (client.preferences as any).deny(peerInboxId);
            console.log("[Sidebar] Blocked peer inbox ID:", peerInboxId);
          }
        }

        // If this was the selected conversation, deselect it
        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(null);
        }

        // Refresh conversations to update the list
        // This will trigger the useEffect that checks blocked/denied states
        await refreshConversations();

        // Update blocked sets immediately for instant UI feedback
        if (conversation instanceof Group) {
          setBlockedGroupIds((prev) => new Set(prev).add(conversation.id));
        } else if (conversation instanceof Dm) {
          const peerInboxId = conversation.peerInboxId as unknown as string;
          if (peerInboxId) {
            setBlockedInboxIds((prev) => new Set(prev).add(peerInboxId));
          }
        }
      } catch (error) {
        console.error("[Sidebar] Error blocking conversation:", error);
      }
    },
    [
      client,
      selectedConversation,
      setSelectedConversation,
      refreshConversations,
    ],
  );
  const navigate = useNavigate();

  // Log conversations when they change
  useEffect(() => {
    console.log("[Sidebar] Conversations changed:", {
      count: conversations.length,
      conversations: conversations.map((c, i) => ({
        index: i,
        id: c.id,
        type: c.constructor.name,
        peerInboxId: "peerInboxId" in c ? c.peerInboxId : undefined,
      })),
    });
  }, [conversations]);

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
            <div className="flex flex-row gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 p-1 md:h-fit md:p-2"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedConversation(null);
                      navigate("/");
                    }}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end" className="hidden md:block">
                  New Chat
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
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
          {!conversations || conversations.length === 0 ? (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 py-2 text-sm text-muted-foreground">
              Your conversations will appear here once you start chatting!
            </div>
          ) : (
            (() => {
              // Log raw conversations array
              console.log("[Sidebar] ===== CONVERSATION LIST DEBUG =====");
              console.log("[Sidebar] Raw conversations array:", conversations);
              console.log(
                "[Sidebar] Raw conversations count:",
                conversations.length,
              );
              console.log(
                "[Sidebar] Raw conversation IDs:",
                conversations.map((c, i) => ({
                  index: i,
                  id: c.id,
                  type: c.constructor.name,
                  peerInboxId: "peerInboxId" in c ? c.peerInboxId : undefined,
                })),
              );

              // Check for duplicates in raw array
              const rawIdCounts = new Map<string, number[]>();
              conversations.forEach((c, i) => {
                if (!rawIdCounts.has(c.id)) {
                  rawIdCounts.set(c.id, []);
                }
                rawIdCounts.get(c.id)?.push(i);
              });
              const rawDuplicates = Array.from(rawIdCounts.entries()).filter(
                ([_, indices]) => indices.length > 1,
              );
              if (rawDuplicates.length > 0) {
                console.warn(
                  "[Sidebar] DUPLICATES IN RAW ARRAY:",
                  rawDuplicates.map(([id, indices]) => ({
                    id,
                    count: indices.length,
                    indices,
                  })),
                );
              }

              // Deduplicate conversations by ID - keep the first occurrence
              const seenIds = new Set<string>();
              const uniqueConversations = conversations.filter((c, index) => {
                if (seenIds.has(c.id)) {
                  console.warn(
                    "[Sidebar] Filtering out duplicate conversation:",
                    {
                      id: c.id,
                      index,
                      type: c.constructor.name,
                    },
                  );
                  return false;
                }
                seenIds.add(c.id);
                return true;
              });

              console.log("[Sidebar] After deduplication:");
              console.log(
                "[Sidebar] - Total conversations:",
                conversations.length,
              );
              console.log(
                "[Sidebar] - Unique conversations:",
                uniqueConversations.length,
              );
              console.log(
                "[Sidebar] - Unique conversation IDs:",
                uniqueConversations.map((c) => c.id),
              );
              console.log(
                "[Sidebar] - Unique conversation details:",
                uniqueConversations.map((c, i) => ({
                  index: i,
                  id: c.id,
                  type: c.constructor.name,
                  peerInboxId: "peerInboxId" in c ? c.peerInboxId : undefined,
                  key: c.id,
                })),
              );

              // Verify no duplicates remain
              const idCounts = new Map<string, number>();
              uniqueConversations.forEach((c) => {
                idCounts.set(c.id, (idCounts.get(c.id) || 0) + 1);
              });
              const duplicateIds = Array.from(idCounts.entries()).filter(
                ([_, count]) => count > 1,
              );
              if (duplicateIds.length > 0) {
                console.error(
                  "[Sidebar] ERROR: Still have duplicate IDs after filtering:",
                  duplicateIds,
                );
              } else {
                console.log("[Sidebar] ✓ No duplicates in final array");
              }

              console.log("[Sidebar] ===== END DEBUG =====");

              // Filter out blocked/denied conversations
              // We filter synchronously using the blocked sets that are updated by useEffect
              const nonBlockedConversations = uniqueConversations.filter(
                (conversation) => {
                  if (conversation instanceof Group) {
                    // Check if group is in blocked groups set (denied consent state)
                    if (blockedGroupIds.has(conversation.id)) {
                      console.log(
                        "[Sidebar] Filtering out denied group:",
                        conversation.id,
                      );
                      return false;
                    }
                    return true;
                  } else if (conversation instanceof Dm) {
                    // For DMs, check if peer is blocked
                    const peerInboxId =
                      conversation.peerInboxId as unknown as string;
                    if (peerInboxId && blockedInboxIds.has(peerInboxId)) {
                      console.log(
                        "[Sidebar] Filtering out blocked DM:",
                        peerInboxId,
                      );
                      return false;
                    }
                  }
                  return true;
                },
              );

              return nonBlockedConversations.map((conversation, _renderIndex) => {
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
              });
            })()
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserNav />
      </SidebarFooter>
    </SidebarUI>
  );
}
