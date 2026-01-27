import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { Button } from "@ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { TrashIcon } from "@ui/icons";
import { useState } from "react";
import { useIsMobile } from "@hooks/use-mobile";
import { useClient } from "@xmtp/use-client";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (event: React.MouseEvent) => void;
  lastMessagePreview?: string;
  hasUnread?: boolean;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  lastMessagePreview,
  hasUnread = false,
}: ConversationItemProps) {
  const isGroup = conversation instanceof Group;
  const groupName = isGroup ? conversation.name : null;
  const displayId =
    conversation.id.length > 20
      ? `${conversation.id.slice(0, 10)}...${conversation.id.slice(-6)}`
      : conversation.id;
  const displayText =
    isGroup && groupName && groupName !== "Agent Group" ? groupName : displayId;
  const isNamed = isGroup && groupName && groupName !== "Agent Group";

  const _isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <SidebarMenuItem>
      <div className="group/conversation relative flex w-full items-center">
        <SidebarMenuButton
          isActive={isActive}
          className="flex-1 touch-manipulation active:scale-[0.97] active:bg-zinc-800 transition-all duration-200 h-auto py-2 relative"
          onClick={onClick}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5 w-full">
              {hasUnread && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              )}
              <span
                className={`truncate text-xs ${isNamed ? "font-medium" : "font-mono"} ${hasUnread ? "text-foreground" : ""}`}
              >
                {displayText}
              </span>
            </div>
            {lastMessagePreview && (
              <span className="truncate text-[10px] text-muted-foreground/70 w-full">
                {lastMessagePreview}
              </span>
            )}
          </div>
        </SidebarMenuButton>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 h-7 w-7 p-0 transition-all duration-200 group-data-[collapsible=icon]:hidden touch-manipulation active:scale-[0.97] opacity-0 group-hover/conversation:opacity-100 md:opacity-0 md:group-hover/conversation:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <TrashIcon size={14} />
        </Button>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={(e) => {
                setShowDeleteDialog(false);
                onDelete(e);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarMenuItem>
  );
}
