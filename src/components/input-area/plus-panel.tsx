import { useIsMobile } from "@hooks/use-mobile";
import { Input } from "@ui/input";
import { useEffect, useState } from "react";
import type { AgentConfig } from "@xmtp/agents";
import { cn, isEnsDomain, isValidAddress, resolveToAddress } from "@/src/utils";
import { Loader2Icon } from "@ui/icons";

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
  const [isResolving, setIsResolving] = useState(false);
  const [customAgent, setCustomAgent] = useState<AgentConfig | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Filter agents by name
  const filteredAgents = agentFilter.trim()
    ? agents.filter((agent) =>
        agent.name.toLowerCase().includes(agentFilter.toLowerCase()),
      )
    : agents;

  // Check if input is an ENS domain or address
  const inputTrimmed = agentFilter.trim();
  const isEnsOrAddress =
    isEnsDomain(inputTrimmed) || isValidAddress(inputTrimmed);

  // Resolve ENS or validate address when input changes
  useEffect(() => {
    if (!open || !isEnsOrAddress) {
      setCustomAgent(null);
      setResolveError(null);
      return;
    }

    let cancelled = false;

    const resolveInput = async () => {
      setIsResolving(true);
      setResolveError(null);
      setCustomAgent(null);

      try {
        const address = await resolveToAddress(inputTrimmed);
        if (cancelled) return;

        if (!address) {
          setResolveError("Could not resolve address");
          return;
        }

        // Check if this address is already in the agents list
        const existingAgent = agents.find(
          (a) => a.address.toLowerCase() === address.toLowerCase(),
        );

        if (existingAgent) {
          setCustomAgent(null);
          return;
        }

        // Create a custom agent config
        const custom: AgentConfig = {
          name: isEnsDomain(inputTrimmed)
            ? inputTrimmed
            : address.slice(0, 6) + "..." + address.slice(-4),
          address: address.toLowerCase(),
          networks: ["production"],
          live: true,
          domain: isEnsDomain(inputTrimmed) ? inputTrimmed : undefined,
        };

        setCustomAgent(custom);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Failed to resolve";
        setResolveError(message);
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    void resolveInput();

    return () => {
      cancelled = true;
    };
  }, [inputTrimmed, isEnsOrAddress, open, agents]);

  // Clear filter when panel closes
  useEffect(() => {
    if (!open) {
      setAgentFilter("");
      setCustomAgent(null);
      setResolveError(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-fade-in-up">
      <div className="w-full rounded border border-zinc-800 bg-zinc-950 shadow-lg overflow-hidden">
        <div className="flex flex-col">
          {/* Add Agent Section */}
          <div className="px-2 py-2 border-b border-zinc-800">
            <Input
              placeholder="Search agents, 0x... or .eth"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="h-7 text-xs border-0 bg-transparent"
              autoFocus={!isMobile}
            />
          </div>
          <div className="overflow-y-auto max-h-[200px] px-2 py-2">
            {/* Show custom agent option if resolved */}
            {customAgent && (
              <button
                type="button"
                onClick={() => {
                  const isSelected = selectedAgents.some(
                    (a) => a.address === customAgent.address,
                  );
                  if (!isSelected) {
                    onSelectAgent(customAgent);
                  }
                }}
                disabled={selectedAgents.some(
                  (a) => a.address === customAgent.address,
                )}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200 mb-1",
                  selectedAgents.some(
                    (a) => a.address === customAgent.address,
                  )
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-zinc-800 cursor-pointer active:scale-[0.97]",
                )}
              >
                <div className="h-8 w-8 shrink-0 rounded bg-muted" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="truncate text-xs text-foreground">
                    {customAgent.domain || customAgent.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {customAgent.address.slice(0, 6)}...
                    {customAgent.address.slice(-4)}
                  </span>
                </div>
              </button>
            )}

            {/* Show loading state */}
            {isResolving && (
              <div className="flex items-center gap-2 px-2 py-4 text-xs text-muted-foreground">
                <Loader2Icon className="h-4 w-4 animate-spin" size={16} />
                Resolving...
              </div>
            )}

            {/* Show error state */}
            {resolveError && !isResolving && (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                {resolveError}
              </div>
            )}

            {/* Show filtered agents */}
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
            {filteredAgents.length === 0 &&
              !customAgent &&
              !isResolving &&
              !resolveError && (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                  {agentFilter.trim() ? "No agents found" : "No agents available"}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
