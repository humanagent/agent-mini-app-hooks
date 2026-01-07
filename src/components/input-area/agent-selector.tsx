import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type AgentConfig } from "@/agent-registry/agents";

type AgentSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AgentConfig[];
  selectedAgents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig) => void;
  title?: string;
  placeholder?: string;
};

export function AgentSelector({
  open,
  onOpenChange,
  agents,
  selectedAgents,
  onSelectAgent,
  title = "Select Agent",
  placeholder = "Search agents...",
}: AgentSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {title} - Select an agent from the list
        </DialogDescription>
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
                    value={agent.name}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSelectAgent(agent);
                      }
                    }}
                    onSelect={() => {
                      onSelectAgent(agent);
                    }}
                    className={cn(
                      "flex items-center gap-2",
                      isSelected && "opacity-50",
                    )}
                  >
                    {agent.image ? (
                      <img
                        alt={agent.name}
                        className="h-6 w-6 shrink-0 rounded object-cover"
                        src={agent.image}
                      />
                    ) : (
                      <div className="h-6 w-6 shrink-0 rounded bg-muted" />
                    )}
                    <span className="flex-1 truncate text-left">
                      {agent.name}
                    </span>
                    {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" />}
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
}
