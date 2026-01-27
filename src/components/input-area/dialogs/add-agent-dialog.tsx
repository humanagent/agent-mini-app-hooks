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
import type { AgentConfig } from "@xmtp/agents";

export function AddAgentDialog({
  open,
  onOpenChange,
  agent,
  isAdding,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentConfig | null;
  isAdding: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add agent to conversation</DialogTitle>
          <DialogDescription>
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
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={onConfirm}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" size={16} />
                Adding...
              </>
            ) : (
              "Add agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
