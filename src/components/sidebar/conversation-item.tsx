import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { Button } from "@ui/button";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@ui/sidebar";
import { TrashIcon } from "@ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (event: React.MouseEvent) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: ConversationItemProps) {
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
  const isNamed = isGroup && groupName && groupName !== "Agent Group";

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
    longPressTimerRef.current = setTimeout(() => {
      // Long press detected - trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Show delete button on long press
      const deleteButton = e.currentTarget.querySelector("button");
      if (deleteButton) {
        deleteButton.style.opacity = "1";
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <SidebarMenuItem>
      <div className="group/conversation relative flex w-full items-center">
        <SidebarMenuButton
          isActive={isActive}
          className={`
            flex-1
            touch-manipulation
            ${isPressed ? "scale-[0.97] bg-sidebar-accent" : ""}
            active:scale-[0.97] active:bg-sidebar-accent
            transition-transform duration-150
          `}
          onClick={onClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={displayText}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`truncate text-xs group-data-[collapsible=icon]:hidden ${isNamed ? "font-medium" : "font-mono"}`}
            >
              {displayText}
            </motion.span>
          </AnimatePresence>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover/conversation:opacity-100 md:opacity-0 md:group-hover/conversation:opacity-100 h-6 w-6 p-0 ml-1 transition-opacity group-data-[collapsible=icon]:hidden touch-manipulation active:scale-95"
            onClick={onDelete}
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
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
}
