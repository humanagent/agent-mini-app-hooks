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
import { Input } from "@ui/input";
import { TrashIcon } from "@ui/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@hooks/use-mobile";
import { useClient } from "@xmtp/use-client";
import { useConversationMembers } from "@xmtp/use-conversation-members";
import { matchAgentsFromMembers } from "@lib/agent-utils";
import { AI_AGENTS } from "@xmtp/agents";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (event: React.MouseEvent) => void;
  onNameUpdated?: () => void;
  lastMessagePreview?: string;
  hasUnread?: boolean;
}

const DEFAULT_GROUP_NAME = "Agent Group";

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  onNameUpdated,
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
    isGroup && groupName && groupName !== DEFAULT_GROUP_NAME
      ? groupName
      : displayId;
  const isNamed =
    isGroup && groupName && groupName !== DEFAULT_GROUP_NAME;

  const _isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { client } = useClient();
  const { members } = useConversationMembers(conversation.id, client);
  const conversationAgents = matchAgentsFromMembers(members, AI_AGENTS);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  const handleSaveName = useCallback(() => {
    if (!isGroup || !(conversation instanceof Group)) {
      setIsEditingName(false);
      return;
    }
    const trimmed = editNameValue.trim();
    const nameToSet = trimmed || DEFAULT_GROUP_NAME;
    void conversation.updateName(nameToSet).then(() => {
      setIsEditingName(false);
      onNameUpdated?.();
    });
  }, [
    conversation,
    editNameValue,
    isGroup,
    onNameUpdated,
  ]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingName(false);
    setEditNameValue(isGroup ? conversation.name ?? "" : "");
  }, [conversation, isGroup]);

  const handleNameDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isGroup) return;
      e.stopPropagation();
      e.preventDefault();
      setEditNameValue(conversation.name ?? "");
      setIsEditingName(true);
    },
    [conversation, isGroup],
  );

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveName();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelEdit();
      }
    },
    [handleSaveName, handleCancelEdit],
  );

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
            <div
              className="flex items-center gap-1.5 w-full"
              onClick={isEditingName ? (e) => e.stopPropagation() : undefined}
              onKeyDown={isEditingName ? (e) => e.stopPropagation() : undefined}
              role={isEditingName ? "group" : undefined}
              aria-label={isEditingName ? "Edit group name" : undefined}
            >
              {hasUnread && !isEditingName && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              )}
              {isEditingName ? (
                <Input
                  ref={nameInputRef}
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleNameKeyDown}
                  className="h-6 min-w-0 flex-1 py-1 text-xs font-mono"
                  aria-label="Group name"
                />
              ) : (
                <span
                  className={`truncate text-xs ${isNamed ? "font-medium" : "font-mono"} ${hasUnread ? "text-foreground" : ""} ${isGroup ? "cursor-text select-text" : ""}`}
                  onDoubleClick={handleNameDoubleClick}
                  title={isGroup ? "Double-click to edit name" : undefined}
                >
                  {displayText}
                </span>
              )}
            </div>
            {lastMessagePreview && (
              <div className="flex items-center gap-1.5 w-full">
                {conversationAgents.length > 0 && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {conversationAgents.slice(0, 3).map((agent) =>
                      agent.image ? (
                        <img
                          key={agent.address}
                          alt={agent.name}
                          className="h-3 w-3 shrink-0 rounded object-cover border border-zinc-800"
                          src={agent.image}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          key={agent.address}
                          className="h-3 w-3 shrink-0 rounded bg-zinc-800 border border-zinc-800 flex items-center justify-center"
                          title={agent.name}
                        >
                          <span className="text-[6px] text-muted-foreground leading-none">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ),
                    )}
                    {conversationAgents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground/70 leading-none">
                        +{conversationAgents.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <span className="truncate text-[10px] text-muted-foreground/70 flex-1">
                  {lastMessagePreview}
                </span>
              </div>
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
