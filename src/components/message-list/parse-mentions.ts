import { AI_AGENTS } from "@xmtp/agents";
import type { AgentConfig } from "@xmtp/agents";

export type TextSegment =
  | { type: "text"; content: string }
  | { type: "mention"; agentName: string; agent: AgentConfig };

export function parseAgentMentions(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const allAgents = AI_AGENTS;

  // Create a map of agent names (case-insensitive) to agent configs
  // Deduplicate by address to avoid duplicates
  const agentMap = new Map<string, AgentConfig>();
  const seenAddresses = new Set<string>();

  for (const agent of allAgents) {
    const addressKey = agent.address.toLowerCase();
    if (!seenAddresses.has(addressKey)) {
      seenAddresses.add(addressKey);
      const nameKey = agent.name.toLowerCase();
      if (!agentMap.has(nameKey)) {
        agentMap.set(nameKey, agent);
      }
    }
  }

  // Match @mentions (e.g., @gm, @elsa)
  const mentionRegex = /@(\w+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionStart = match.index;
    const mentionEnd = mentionStart + match[0].length;
    const agentName = match[1].toLowerCase();

    // Add text before the mention
    if (mentionStart > lastIndex) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex, mentionStart),
      });
    }

    // Add the mention if agent exists
    const agent = agentMap.get(agentName);
    if (agent) {
      segments.push({
        type: "mention",
        agentName: match[1],
        agent,
      });
    } else {
      // If agent doesn't exist, treat as regular text
      segments.push({
        type: "text",
        content: match[0],
      });
    }

    lastIndex = mentionEnd;
  }

  // Add remaining text after the last mention
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  // If no mentions found, return the entire text as a single segment
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}
