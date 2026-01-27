import { useIsMobile } from "@hooks/use-mobile";
import { Input } from "@ui/input";
import { useEffect, useState } from "react";
import type { AgentConfig } from "@xmtp/agents";
import { cn, isEnsDomain, isValidAddress, resolveToAddress } from "@/src/utils";
import { Loader2Icon, ChevronRightIcon, PaperclipIcon, RobotIcon } from "@ui/icons";

type PlusPanelProps = {
  open: boolean;
  agents: AgentConfig[];
  selectedAgents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig) => void;
  shouldOpenUp?: boolean;
};

export function PlusPanel({
  open,
  agents,
  selectedAgents,
  onSelectAgent,
  shouldOpenUp = false,
}: PlusPanelProps) {
  const [view, setView] = useState<"main" | "address" | "domain" | "agents">("main");
  const [agentFilter, setAgentFilter] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [domainInput, setDomainInput] = useState("");
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

  // Check if address input is valid
  const addressTrimmed = addressInput.trim();
  const isValidAddressInput = isValidAddress(addressTrimmed);

  // Check if domain input is valid
  const domainTrimmed = domainInput.trim();
  const isValidDomainInput = isEnsDomain(domainTrimmed);

  // Resolve address when address input changes
  useEffect(() => {
    if (!open || view !== "address" || !isValidAddressInput) {
      setCustomAgent(null);
      setResolveError(null);
      return;
    }

    let cancelled = false;

    const resolveAddress = async () => {
      setIsResolving(true);
      setResolveError(null);
      setCustomAgent(null);

      try {
        // Check if this address is already in the agents list
        const existingAgent = agents.find(
          (a) => a.address.toLowerCase() === addressTrimmed.toLowerCase(),
        );

        if (existingAgent) {
          setCustomAgent(null);
          setIsResolving(false);
          return;
        }

        // Create a custom agent config from address
        const custom: AgentConfig = {
          name: addressTrimmed.slice(0, 6) + "..." + addressTrimmed.slice(-4),
          address: addressTrimmed.toLowerCase(),
          networks: ["production"],
          live: true,
        };

        setCustomAgent(custom);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Failed to process address";
        setResolveError(message);
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    void resolveAddress();

    return () => {
      cancelled = true;
    };
  }, [addressTrimmed, isValidAddressInput, open, view, agents]);

  // Resolve domain when domain input changes
  useEffect(() => {
    if (!open || view !== "domain" || !isValidDomainInput) {
      setCustomAgent(null);
      setResolveError(null);
      return;
    }

    let cancelled = false;

    const resolveDomain = async () => {
      setIsResolving(true);
      setResolveError(null);
      setCustomAgent(null);

      try {
        const address = await resolveToAddress(domainTrimmed);
        if (cancelled) return;

        if (!address) {
          setResolveError("Could not resolve domain");
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
          name: domainTrimmed,
          address: address.toLowerCase(),
          networks: ["production"],
          live: true,
          domain: domainTrimmed,
        };

        setCustomAgent(custom);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Failed to resolve domain";
        setResolveError(message);
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    void resolveDomain();

    return () => {
      cancelled = true;
    };
  }, [domainTrimmed, isValidDomainInput, open, view, agents]);

  // Reset state when panel closes
  useEffect(() => {
    if (!open) {
      setView("main");
      setAgentFilter("");
      setAddressInput("");
      setDomainInput("");
      setCustomAgent(null);
      setResolveError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleAddAddress = () => {
    if (customAgent && isValidAddressInput) {
      onSelectAgent(customAgent);
      setAddressInput("");
      setCustomAgent(null);
    }
  };

  const handleAddDomain = () => {
    if (customAgent && isValidDomainInput) {
      onSelectAgent(customAgent);
      setDomainInput("");
      setCustomAgent(null);
    }
  };

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50",
        shouldOpenUp
          ? "bottom-full mb-2 animate-fade-in-up"
          : "top-full mt-2 animate-fade-in-down",
      )}
    >
      <div className="w-full rounded border border-zinc-800 bg-zinc-950 shadow-lg overflow-hidden">
        <div className="flex flex-col">
          {view === "main" && (
            <>
              {/* Main Menu */}
              <div className="px-2 py-2 -mt-2">
                <button
                  type="button"
                  onClick={() => setView("address")}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200 hover:bg-zinc-800 cursor-pointer active:scale-[0.97]"
                >
                  <div className="h-8 w-8 shrink-0 rounded bg-muted flex items-center justify-center">
                    <span className="text-xs text-foreground">0x</span>
                  </div>
                  <span className="text-xs text-foreground">Add address</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("domain")}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200 hover:bg-zinc-800 cursor-pointer active:scale-[0.97]"
                >
                  <div className="h-8 w-8 shrink-0 rounded bg-muted flex items-center justify-center">
                    <span className="text-xs text-foreground">.eth</span>
                  </div>
                  <span className="text-xs text-foreground">Add domain</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("agents")}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200 hover:bg-zinc-800 cursor-pointer active:scale-[0.97]"
                >
                  <div className="h-8 w-8 shrink-0 rounded bg-muted flex items-center justify-center">
                    <RobotIcon size={16} className="text-foreground" />
                  </div>
                  <span className="text-xs text-foreground">Add agent</span>
                  <ChevronRightIcon size={16} className="ml-auto text-muted-foreground" />
                </button>
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200 opacity-50 cursor-not-allowed"
                >
                  <div className="h-8 w-8 shrink-0 rounded bg-muted flex items-center justify-center">
                    <PaperclipIcon size={16} className="text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Add attachment</span>
                </button>
              </div>
            </>
          )}

          {view === "address" && (
            <>
              {/* Add Address View */}
              <div className="px-2 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setView("main")}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    ← Back
                  </button>
                </div>
                <Input
                  placeholder="Enter 0x address"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="h-7 text-xs border-0 bg-transparent"
                  autoFocus={!isMobile}
                />
              </div>
              <div className="overflow-y-auto max-h-[200px] px-2 py-2">
                {isResolving && (
                  <div className="flex items-center gap-2 px-2 py-4 text-xs text-muted-foreground">
                    <Loader2Icon className="h-4 w-4 animate-spin" size={16} />
                    Processing...
                  </div>
                )}
                {resolveError && !isResolving && (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    {resolveError}
                  </div>
                )}
                {customAgent && !isResolving && !resolveError && (
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200",
                      "hover:bg-zinc-800 cursor-pointer active:scale-[0.97]",
                    )}
                  >
                    <div className="h-8 w-8 shrink-0 rounded bg-muted" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-xs text-foreground">
                        {customAgent.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {customAgent.address.slice(0, 6)}...
                        {customAgent.address.slice(-4)}
                      </span>
                    </div>
                  </button>
                )}
                {!isValidAddressInput && addressInput.trim() && (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    Invalid address format
                  </div>
                )}
              </div>
            </>
          )}

          {view === "domain" && (
            <>
              {/* Add Domain View */}
              <div className="px-2 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setView("main")}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    ← Back
                  </button>
                </div>
                <Input
                  placeholder="Enter .eth domain"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="h-7 text-xs border-0 bg-transparent"
                  autoFocus={!isMobile}
                />
              </div>
              <div className="overflow-y-auto max-h-[200px] px-2 py-2">
                {isResolving && (
                  <div className="flex items-center gap-2 px-2 py-4 text-xs text-muted-foreground">
                    <Loader2Icon className="h-4 w-4 animate-spin" size={16} />
                    Resolving...
                  </div>
                )}
                {resolveError && !isResolving && (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    {resolveError}
                  </div>
                )}
                {customAgent && !isResolving && !resolveError && (
                  <button
                    type="button"
                    onClick={handleAddDomain}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200",
                      "hover:bg-zinc-800 cursor-pointer active:scale-[0.97]",
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
                {!isValidDomainInput && domainInput.trim() && (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    Invalid domain format
                  </div>
                )}
              </div>
            </>
          )}

          {view === "agents" && (
            <>
              {/* Add Agent View */}
              <div className="px-2 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setView("main")}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    ← Back
                  </button>
                </div>
                <Input
                  placeholder="Search agents"
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="h-7 text-xs border-0 bg-transparent"
                  autoFocus={!isMobile}
                />
              </div>
              <div className="overflow-y-auto max-h-[200px] px-2 py-2">
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
                {filteredAgents.length === 0 && (
                  <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                    {agentFilter.trim() ? "No agents found" : "No agents available"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
