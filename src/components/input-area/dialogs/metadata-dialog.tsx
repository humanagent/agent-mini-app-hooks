import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { useState, useEffect } from "react";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";

export function MetadataDialog({
  open,
  onOpenChange,
  conversation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
}) {
  const [metadata, setMetadata] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && conversation) {
      void (async () => {
        setIsLoading(true);
        try {
          const members = await conversation.members();
          const isGroup = conversation instanceof Group;
          const conversationData = {
            id: conversation.id,
            ...(isGroup
              ? {
                  name: (conversation as Group).name,
                  description: (conversation as Group).description,
                }
              : {}),
            members: members.map((member) => ({
              inboxId: member.inboxId,
              accountIdentifiers: member.accountIdentifiers,
              installationIds: member.installationIds,
              permissionLevel: member.permissionLevel,
              consentState: member.consentState,
            })),
          };
          setMetadata(JSON.stringify(conversationData, null, 2));
        } catch (err) {
          console.error("[Metadata] Error fetching metadata:", err);
          setMetadata(
            JSON.stringify(
              {
                error:
                  err instanceof Error
                    ? err.message
                    : "Failed to fetch metadata",
              },
              null,
              2,
            ),
          );
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [open, conversation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Conversation Metadata</DialogTitle>
          <DialogDescription>
            JSON details of the conversation including id, members, and other
            metadata.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading metadata...
            </div>
          ) : (
            <pre className="flex-1 min-h-0 overflow-auto rounded border border-zinc-800 bg-zinc-950 p-4 text-[10px]">
              <code className="block whitespace-pre-wrap break-words">
                {metadata || "No data available"}
              </code>
            </pre>
          )}
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
