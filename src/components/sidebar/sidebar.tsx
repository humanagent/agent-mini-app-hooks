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
import { Group } from "@xmtp/browser-sdk";
import { useEffect } from "react";
import { shortAddress } from "@/lib/utils";
import { Link, useLocation } from "react-router";
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
  const { client: _client } = useXMTPClient();
  const { conversations, selectedConversation, setSelectedConversation } =
    useConversationsContext();
  const location = useLocation();

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
                  >
                    <TrashIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end" className="hidden md:block">
                  Delete All Chats
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 p-1 md:h-fit md:p-2"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedConversation(null);
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

              return uniqueConversations.map((conversation, _renderIndex) => {
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
                    <SidebarMenuButton
                      isActive={isActive}
                      className="cursor-pointer"
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
