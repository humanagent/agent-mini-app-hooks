import type { AgentConfig } from "@/agent-registry/agents";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function appendAgentMentions(
  message: string,
  conversationAgents: AgentConfig[],
  currentSelectedAgents: AgentConfig[],
): string {
  // Use conversationAgents if available (existing conversation), otherwise use selected agents
  const agentsToMention =
    conversationAgents.length > 0 ? conversationAgents : currentSelectedAgents;

  if (agentsToMention.length === 0) {
    return message;
  }
  const mentions = agentsToMention.map((agent) => `@${agent.name}`).join(" ");
  return `${message} ${mentions}`;
}
