import { useIsMobile } from "@hooks/use-mobile";
import { Input } from "@ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { AgentConfig } from "@/src/agents";
import { cn } from "@/src/utils";

type PlusPanelProps = {
  open: boolean;
  agents: AgentConfig[];
  selectedAgents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig) => void;
};

export function PlusPanel({
  open,
  agents,
  selectedAgents,
  onSelectAgent,
}: PlusPanelProps) {
  const [agentFilter, setAgentFilter] = useState("");
  const isMobile = useIsMobile();

  // Filter agents by name
  const filteredAgents = agentFilter.trim()
    ? agents.filter((agent) =>
        agent.name.toLowerCase().includes(agentFilter.toLowerCase()),
      )
    : agents;

  // Clear filter when panel closes
  useEffect(() => {
    if (!open) {
      setAgentFilter("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute bottom-full left-0 right-0 mb-2 z-50"
        >
          <div className="w-full rounded border border-zinc-800 bg-zinc-950 shadow-lg overflow-hidden">
            <div className="flex flex-col">
              {/* Add Agent Section */}
              <div className="px-2 py-2 border-b border-zinc-800">
                <Input
                  placeholder="Search agents or 0x..."
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="h-7 text-xs border-0 bg-transparent"
                  autoFocus={!isMobile}
                />
              </div>
              <div className="overflow-y-auto max-h-[200px] px-2 py-2">
                {filteredAgents.map((agent) => {
                  const isSelected = selectedAgents.some(
                    (a) => a.address === agent.address,
                  );
                  return (
                    <button
                      key={agent.address}
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          onSelectAgent(agent);
                        }
                      }}
                      disabled={isSelected}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200",
                        isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-zinc-800 cursor-pointer active:scale-[0.97]",
                      )}
                    >
                      {agent.image ? (
                        <img
                          alt={agent.name}
                          className="h-8 w-8 shrink-0 rounded object-cover"
                          src={agent.image}
                        />
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded bg-muted" />
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate text-xs text-foreground">
                          {agent.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredAgents.length === 0 && (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    {agentFilter.trim()
                      ? "No agents found"
                      : "No agents available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
