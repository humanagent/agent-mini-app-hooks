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
import { TrashIcon, Loader2Icon, CheckIcon } from "@ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@hooks/use-mobile";
import { useToast } from "@ui/toast";

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

  const isMobile = useIsMobile();
  const { showToast } = useToast();
  const [isPressed, setIsPressed] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTouchStart = (_e: React.TouchEvent) => {
    setIsPressed(true);
    if (isMobile) {
      // On mobile, show delete button on tap
      setShowDeleteButton(true);
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    // On mobile, if user taps outside the delete button, hide it
    if (isMobile && showDeleteButton) {
      const target = e.target as HTMLElement;
      const deleteButton = e.currentTarget
        .closest(".group/conversation")
        ?.querySelector('button[type="button"]');
      if (deleteButton && !deleteButton.contains(target)) {
        // Small delay to allow delete button click to register
        setTimeout(() => {
          setShowDeleteButton(false);
        }, 200);
      }
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
    if (isMobile) {
      setTimeout(() => {
        setShowDeleteButton(false);
      }, 200);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) {
      return;
    }
    if (isMobile && showDeleteButton) {
      // On mobile, if delete button is shown, clicking the item should navigate
      const target = e.target as HTMLElement;
      const deleteButton = e.currentTarget.querySelector(
        'button[type="button"]',
      );
      if (deleteButton && !deleteButton.contains(target)) {
        setShowDeleteButton(false);
        onClick();
        return;
      }
    }
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGroup || isSaving) {
      return;
    }
    console.log("[ConversationItem] Starting edit mode");
    setIsEditing(true);
    setEditValue(groupName && groupName !== "Agent Group" ? groupName : "");
    setShowSuccess(false);
  };

  const handleSave = async () => {
    if (!isGroup || isSaving) {
      return;
    }

    const trimmedValue = editValue.trim();

    if (!trimmedValue) {
      console.log("[ConversationItem] Empty name, canceling edit");
      handleCancel();
      return;
    }

    if (trimmedValue === groupName) {
      console.log("[ConversationItem] Name unchanged, canceling edit");
      handleCancel();
      return;
    }

    console.log("[ConversationItem] Saving new name:", trimmedValue);
    setIsSaving(true);

    try {
      await conversation.updateName(trimmedValue);
      console.log("[ConversationItem] Name updated successfully");

      setShowSuccess(true);
      showToast(`Renamed to "${trimmedValue}"`, "success");

      setTimeout(() => {
        setIsEditing(false);
        setEditValue("");
        setIsSaving(false);
        setShowSuccess(false);
      }, 800);
    } catch (error) {
      console.error("[ConversationItem] Error updating name:", error);
      setIsSaving(false);
      showToast("Failed to update name. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    if (isSaving) {
      return;
    }
    console.log("[ConversationItem] Canceling edit");
    setIsEditing(false);
    setEditValue("");
    setShowSuccess(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <SidebarMenuItem>
      <div className="group/conversation relative flex w-full items-center">
        <SidebarMenuButton
          isActive={isActive}
          className={`
            flex-1
            touch-manipulation
            ${isPressed ? "scale-[0.97] bg-zinc-800" : ""}
            active:scale-[0.97] active:bg-zinc-800
            transition-all duration-200
            h-auto py-2
          `}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5 w-full">
              {hasUnread && !isEditing && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              )}
              {isEditing && isGroup ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                    placeholder="Enter conversation name"
                    className={`truncate text-xs font-medium bg-transparent border-none outline-none focus:outline-none flex-1 text-foreground placeholder:text-muted-foreground ${isSaving ? "opacity-70" : ""}`}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  />
                  {isSaving && (
                    <Loader2Icon
                      size={12}
                      className="shrink-0 animate-spin text-muted-foreground"
                    />
                  )}
                  {showSuccess && !isSaving && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                    >
                      <CheckIcon size={12} className="shrink-0 text-accent" />
                    </motion.div>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayText}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    onDoubleClick={handleDoubleClick}
                    className={`truncate text-xs ${isNamed ? "font-medium" : "font-mono"} ${hasUnread ? "text-foreground" : ""} ${isGroup ? "cursor-text" : ""}`}
                  >
                    {displayText}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
            {lastMessagePreview && (
              <span className="truncate text-[10px] text-muted-foreground/70 w-full">
                {lastMessagePreview}
              </span>
            )}
          </div>
        </SidebarMenuButton>
        {!isEditing && !isSaving && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={`absolute right-2 h-7 w-7 p-0 transition-all duration-200 group-data-[collapsible=icon]:hidden touch-manipulation active:scale-[0.97] ${
              isMobile
                ? showDeleteButton
                  ? "opacity-100"
                  : "opacity-0"
                : "opacity-0 group-hover/conversation:opacity-100 md:opacity-0 md:group-hover/conversation:opacity-100"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
              if (isMobile) {
                setShowDeleteButton(false);
              }
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (navigator.vibrate) {
                navigator.vibrate(30);
              }
            }}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <TrashIcon size={14} />
          </Button>
        )}
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
