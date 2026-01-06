import { useState } from "react";
import { motion } from "framer-motion";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { Button } from "@ui/button";
import { ShareIcon, AddPeopleIcon, MenuIcon } from "@ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Input } from "@ui/input";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function AddPeopleDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}) {
  const [address, setAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshConversations } = useConversationsContext();

  const handleAdd = async () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError("Address is required");
      return;
    }

    if (!isValidEthereumAddress(trimmedAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    setError(null);
    setIsAdding(true);

    try {
      console.log("[AddPeople] Adding member:", trimmedAddress);
      await group.addMembersByIdentifiers([
        {
          identifier: trimmedAddress.toLowerCase(),
          identifierKind: "Ethereum" as const,
        },
      ]);
      console.log("[AddPeople] Member added successfully");
      setAddress("");
      onOpenChange(false);
      void refreshConversations();
    } catch (err) {
      console.error("[AddPeople] Error adding member:", err);
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add people to group</DialogTitle>
          <DialogDescription>
            Enter an Ethereum address to add to this group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="0x..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isAdding) {
                void handleAdd();
              }
            }}
            disabled={isAdding}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isAdding || !address.trim()}>
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ChatHeader = ({
  conversation,
}: {
  conversation: Conversation | null;
}) => {
  const [addPeopleOpen, setAddPeopleOpen] = useState(false);
  const isGroup = conversation instanceof Group;

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-2 md:px-4">
        <div className="flex items-center gap-2">
          <SidebarToggle />
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 px-2 md:h-fit md:px-2"
                variant="ghost"
                type="button"
              >
                <ShareIcon size={16} />
                <span className="ml-1 hidden md:inline text-sm">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share conversation</TooltipContent>
          </Tooltip>
          {isGroup && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-8 px-2 md:h-fit md:px-2"
                  variant="ghost"
                  type="button"
                  onClick={() => setAddPeopleOpen(true)}
                >
                  <AddPeopleIcon size={16} />
                  <span className="ml-1 hidden md:inline text-sm">
                    Add people
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add people to conversation</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 px-2 md:h-fit md:px-2"
                variant="ghost"
                type="button"
              >
                <MenuIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
        </div>
      </header>
      {isGroup && (
        <AddPeopleDialog
          open={addPeopleOpen}
          onOpenChange={setAddPeopleOpen}
          group={conversation}
        />
      )}
    </>
  );
};

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.15 }}
      >
        Hello there
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-xl text-muted-foreground md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6, duration: 0.15 }}
      >
        This chat is secured by XMTP. Each conversation its a new identity,
        untraceable to the previous one
      </motion.div>
    </div>
  );
};
