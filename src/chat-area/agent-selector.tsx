import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Dialog, DialogContent, DialogTitle } from "@ui/dialog";
import type { AgentConfig } from "@/lib/agents";
import { cn } from "@/lib/utils";

export type AgentSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AgentConfig[];
  selectedAgents: AgentConfig[];
  onAddAgent: (agent: AgentConfig) => void;
  placeholder?: string;
};

export const AgentSelector = ({
  open,
  onOpenChange,
  agents,
  selectedAgents,
  onAddAgent,
  placeholder = "Search agents...",
}: AgentSelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Agent Selector</DialogTitle>
        <Command className="**:data-[slot=command-input-wrapper]:h-auto">
          <CommandInput className="h-auto py-3.5" placeholder={placeholder} />
          <CommandList>
            <CommandGroup heading="AI Agents">
              {agents.map((agent) => {
                const isSelected = selectedAgents.some(
                  (a) => a.address === agent.address,
                );
                return (
                  <CommandItem
                    key={agent.address}
                    value={agent.address}
                    disabled={isSelected}
                    onSelect={() => {
                      if (!isSelected) {
                        onAddAgent(agent);
                      }
                    }}
                    className={cn(isSelected && "opacity-50")}>
                    <span className="flex-1 truncate text-left">
                      {agent.name}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {agents.length === 0 && (
              <CommandEmpty>No agents found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export type AgentSelectorNameProps = {
  selectedAgents: AgentConfig[];
};

export const AgentSelectorName = ({
  selectedAgents,
}: AgentSelectorNameProps) => (
  <span className="flex-1 truncate text-left">
    {selectedAgents.length > 0
      ? `${selectedAgents.length} agent${selectedAgents.length > 1 ? "s" : ""}`
      : "Select agent"}
  </span>
);
