import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Loader2Icon } from "@ui/icons";
import type { AgentConfig } from "@/src/agents";

export function RemoveAgentDialog({
  open,
  onOpenChange,
  agent,
  isRemoving,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentConfig | null;
  isRemoving: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove agent from conversation</DialogTitle>
          {agent && (
            <div className="flex items-center gap-3 mt-2">
              {agent.image ? (
                <img
                  alt={agent.name}
                  className="h-12 w-12 shrink-0 rounded object-cover"
                  src={agent.image}
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-muted" />
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {agent.name}
                </span>
                {agent.tagline && (
                  <span className="text-xs text-muted-foreground">
                    {agent.tagline}
                  </span>
                )}
              </div>
            </div>
          )}
          <DialogDescription className="mt-3">
            This agent will be removed from the conversation and won't receive
            future messages.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" size={16} />
                Removing...
              </>
            ) : (
              "Remove agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
