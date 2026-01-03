import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useXMTPConversations } from "@hooks/use-xmtp-conversations";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { PlusIcon, TrashIcon } from "@ui/icons";
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
import { useEffect, useState } from "react";
import { shortAddress } from "@/lib/utils";

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
    {...props}>
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
              data-testid="user-nav-button">
              <div className="flex aspect-square size-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xs font-semibold">{initial}</span>
              </div>
              <span
                className="flex-1 truncate text-left"
                data-testid="user-email">
                {displayAddress}
              </span>
              <ChevronUpIcon className="ml-auto shrink-0" size={16} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width)"
            data-testid="user-nav-menu"
            side="top">
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
  const { conversations, selectedConversation, setSelectedConversation } =
    useXMTPConversations(client);
  const [conversationLabels, setConversationLabels] = useState<
    Map<string, string>
  >(new Map());

  useEffect(() => {
    if (!client || conversations.length === 0) {
      return;
    }

    const loadLabels = async () => {
      const labels = new Map<string, string>();

      for (const conversation of conversations) {
        try {
          const members = await conversation.members();
          const otherMember = members.find(
            (m) =>
              m.inboxId.toLowerCase() !== (client?.inboxId || "").toLowerCase(),
          );

          if (otherMember) {
            const address = otherMember.inboxId;
            labels.set(
              conversation.id,
              address.slice(0, 6) + "..." + address.slice(-4),
            );
          } else {
            labels.set(conversation.id, "Unknown");
          }
        } catch (error) {
          console.error(
            `[Sidebar] Error loading label for conversation ${conversation.id}:`,
            error,
          );
          labels.set(conversation.id, "Unknown");
        }
      }

      setConversationLabels(labels);
    };

    void loadLabels();
  }, [client, conversations]);

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
                    variant="ghost">
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
                    }}>
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
          {!conversations || conversations.length === 0 ? (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 py-2 text-sm text-muted-foreground">
              Your conversations will appear here once you start chatting!
            </div>
          ) : (
            conversations.map((conversation) => {
              const label =
                conversationLabels.get(conversation.id) ||
                conversation.id.slice(0, 20) ||
                "Conversation";
              const isActive = selectedConversation?.id === conversation.id;

              return (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => {
                      handleConversationClick(conversation);
                    }}>
                    <span className="truncate">{label}</span>
                  </SidebarMenuButton>
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
