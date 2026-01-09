import type { AgentConfig } from "@/agent-registry/agents";

const STORAGE_KEY = "xmtp_dev_portal_agents";

export function getUserAgents(): AgentConfig[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as AgentConfig[];
  } catch (error) {
    console.error("[AgentStorage] Error reading agents:", error);
    return [];
  }
}

export function saveUserAgent(agent: AgentConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const agents = getUserAgents();
    const existingIndex = agents.findIndex((a) => a.address === agent.address);

    if (existingIndex >= 0) {
      agents[existingIndex] = agent;
    } else {
      agents.push(agent);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (error) {
    console.error("[AgentStorage] Error saving agent:", error);
    throw error;
  }
}

export function deleteUserAgent(address: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const agents = getUserAgents();
    const filtered = agents.filter((a) => a.address !== address);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[AgentStorage] Error deleting agent:", error);
    throw error;
  }
}

export function getUserAgentByAddress(address: string): AgentConfig | undefined {
  const agents = getUserAgents();
  return agents.find((a) => a.address.toLowerCase() === address.toLowerCase());
}
