import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { AgentConfig } from "@/agent-registry/agents";
import { cn } from "@/lib/utils";

type SelectorMode = "agent" | "command" | null;

type CommandOption = {
  value: string;
  label: string;
  description: string;
  requiresGroup?: boolean;
  requiresConversation?: boolean;
};

type UnifiedSelectorProps = {
  open: boolean;
  mode: SelectorMode;
  agents: AgentConfig[];
  selectedAgents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig) => void;
  onSelectCommand?: (command: string) => void;
  searchQuery?: string;
  isGroup?: boolean;
  conversation?: boolean;
  onClose?: () => void;
};

const COMMANDS: CommandOption[] = [
  {
    value: "add-member",
    label: "Add member",
    description: "Add people to this group",
    requiresGroup: true,
  },
  {
    value: "metadata",
    label: "Metadata",
    description: "View group metadata",
    requiresGroup: true,
  },
  {
    value: "share",
    label: "Share",
    description: "Share conversation",
    requiresConversation: true,
  },
];

export function UnifiedSelector({
  open,
  mode,
  agents,
  selectedAgents,
  onSelectAgent,
  onSelectCommand,
  searchQuery = "",
  isGroup = false,
  conversation = false,
  onClose,
}: UnifiedSelectorProps) {
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        const items = commandRef.current?.querySelectorAll(
          '[cmdk-item]:not([aria-disabled="true"])',
        );
        if (!items || items.length === 0) return;

        const focusedElement = document.activeElement;
        const currentIndex = Array.from(items).indexOf(
          focusedElement as Element,
        );

        let nextIndex: number;
        if (e.key === "ArrowDown") {
          nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
        } else {
          nextIndex =
            currentIndex === -1
              ? items.length - 1
              : (currentIndex - 1 + items.length) % items.length;
        }

        (items[nextIndex] as HTMLElement).focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const focusedElement = document.activeElement;
        if (
          focusedElement &&
          focusedElement.hasAttribute("cmdk-item") &&
          !focusedElement.hasAttribute("aria-disabled")
        ) {
          (focusedElement as HTMLElement).click();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [open]);

  useEffect(() => {
    if (open && commandRef.current) {
      // Remove focus from textarea and focus the first item
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }

      // Focus the first item in the command list
      setTimeout(() => {
        const firstItem = commandRef.current?.querySelector(
          '[cmdk-item]:not([aria-disabled="true"])',
        );
        if (firstItem instanceof HTMLElement) {
          firstItem.focus();
        }
      }, 50);
    }
  }, [open]);

  if (!open || !mode) {
    return null;
  }

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const availableCommands = COMMANDS.filter((cmd) => {
    if (cmd.requiresGroup && !isGroup) return false;
    if (cmd.requiresConversation && !conversation) return false;
    return true;
  });

  const filteredCommands = availableCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute bottom-full left-0 right-0 mb-2 z-50"
        >
          <div
            className="w-full rounded border border-zinc-800 bg-zinc-950 shadow-lg"
            ref={commandRef}
          >
            <Command className="text-left" shouldFilter={false}>
              <CommandList className="max-h-[280px]">
                {mode === "agent" && (
                  <CommandGroup
                    heading={
                      conversation
                        ? "Agents in conversation"
                        : "Select an agent"
                    }
                  >
                    {filteredAgents.map((agent) => {
                      const isSelected = selectedAgents.some(
                        (a) => a.address === agent.address,
                      );
                      return (
                        <CommandItem
                          key={agent.address}
                          value={agent.name}
                          disabled={isSelected}
                          onSelect={() => {
                            if (!isSelected) {
                              onSelectAgent(agent);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer justify-start",
                            isSelected && "opacity-50",
                          )}
                          tabIndex={isSelected ? -1 : 0}
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
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="truncate text-left text-xs">
                              {agent.name}
                            </span>
                            {agent.tagline && (
                              <span className="truncate text-left text-[10px] text-muted-foreground">
                                {agent.tagline}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                {mode === "command" && (
                  <CommandGroup heading="Commands">
                    {filteredCommands.map((cmd) => (
                      <CommandItem
                        key={cmd.value}
                        value={cmd.value}
                        onSelect={() => {
                          onSelectCommand?.(cmd.value);
                        }}
                        className="flex items-center gap-2 cursor-pointer justify-start"
                        tabIndex={0}
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-left text-xs">
                            /{cmd.label.toLowerCase()}
                          </span>
                          <span className="text-left text-[10px] text-muted-foreground">
                            {cmd.description}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {mode === "agent" && filteredAgents.length === 0 && (
                  <CommandEmpty className="text-left">
                    {conversation
                      ? "No agents in this conversation."
                      : "No agents available."}
                  </CommandEmpty>
                )}

                {mode === "command" && filteredCommands.length === 0 && (
                  <CommandEmpty className="text-left">
                    No commands found.
                  </CommandEmpty>
                )}
              </CommandList>
            </Command>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
