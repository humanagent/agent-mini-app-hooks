import type { AgentConfig } from "@xmtp/agents";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
