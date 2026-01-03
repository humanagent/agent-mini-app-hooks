import { AgentSelector } from "@chat-area/agent-selector";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@chat-area/prompt-input";
import { Button } from "@ui/button";
import { ArrowUpIcon, PlusIcon } from "@ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { AI_AGENTS, type AgentConfig } from "@/lib/agents";

export function InputArea({
  selectedAgents = [],
  setSelectedAgents,
  sendMessage,
}: {
  selectedAgents?: AgentConfig[];
  setSelectedAgents?: (agents: AgentConfig[]) => void;
  sendMessage?: (content: string) => void;
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [liveAgents] = useState(() =>
    shuffleArray(AI_AGENTS.filter((agent) => agent.live)),
  );

  const handleAddAgent = (agent: AgentConfig) => {
    if (!setSelectedAgents) return;
    if (selectedAgents.some((a) => a.address === agent.address)) {
      return;
    }
    setSelectedAgents([...selectedAgents, agent]);
    setOpen(false);
  };

  const handleRemoveAgent = (address: string) => {
    if (!setSelectedAgents) return;
    setSelectedAgents(selectedAgents.filter((a) => a.address !== address));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageContent = input.trim();

    if (!messageContent || !sendMessage) {
      return;
    }

    sendMessage(messageContent);
    setInput("");
  };

  return (
    <div className="relative flex w-full flex-col gap-2">
      <PromptInput
        className="rounded-md border border-border bg-background p-2 transition-all duration-150 focus-within:border-border hover:border-muted-foreground/50"
        onSubmit={handleSubmit}>
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          <Button
            className="h-7 w-7 p-0 shrink-0"
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(true);
            }}>
            <PlusIcon size={14} />
          </Button>
          <PromptInputTextarea
            className="grow resize-none border-0! border-none! bg-transparent px-1 py-1 text-sm outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden min-h-[24px] max-h-[120px]"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
          />
        </div>
        <PromptInputToolbar className="border-top-0! border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
          <PromptInputTools className="gap-0 sm:gap-0.5">
            <AgentSelector
              open={open}
              onOpenChange={setOpen}
              agents={liveAgents}
              selectedAgents={selectedAgents}
              onAddAgent={handleAddAgent}
            />
            <AnimatePresence mode="popLayout">
              {selectedAgents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 overflow-hidden">
                  {selectedAgents.map((agent) => (
                    <motion.div
                      key={agent.address}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground h-6">
                      <span>{agent.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveAgent(agent.address);
                        }}
                        className="rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </PromptInputTools>

          <PromptInputSubmit
            className="size-7 rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-[#3d8aff] disabled:bg-muted disabled:text-muted-foreground"
            disabled={!input.trim()}>
            <ArrowUpIcon size={12} />
          </PromptInputSubmit>
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
