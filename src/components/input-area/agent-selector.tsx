import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@ui/sheet";
import { Check } from "lucide-react";
import type { AgentConfig } from "@/agent-registry/agents";
import { cn } from "@/lib/utils";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-zinc-950 border-t border-zinc-800 rounded-t p-0 md:max-w-[calc(56rem-2rem)] md:mx-auto"
      >
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-left">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 p-4">
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
                          onOpenChange(false);
                        }
                      }}
                      onSelect={() => {
                        onSelectAgent(agent);
                        onOpenChange(false);
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
                      {isSelected && (
                        <Check className="ml-2 h-4 w-4 shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {agents.length === 0 && (
                <CommandEmpty>No agents found.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      </SheetContent>
    </Sheet>
  );
}
