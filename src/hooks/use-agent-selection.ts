import { useState, useCallback } from "react";
import type { AgentConfig } from "@/src/agents";

export function useAgentSelection() {
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);

  const addAgent = useCallback((agent: AgentConfig) => {
    setSelectedAgents((prev) => {
      const exists = prev.some((a) => a.address === agent.address);
      if (exists) {
        return prev;
      }
      return [...prev, agent];
    });
  }, []);

  const removeAgent = useCallback((address: string) => {
    setSelectedAgents((prev) =>
      prev.filter((a) => a.address.toLowerCase() !== address.toLowerCase()),
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAgents([]);
  }, []);

  return {
    selectedAgents,
    setSelectedAgents,
    addAgent,
    removeAgent,
    clearSelection,
  };
}
