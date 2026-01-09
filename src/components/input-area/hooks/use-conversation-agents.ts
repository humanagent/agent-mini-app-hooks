import { useEffect, useState } from "react";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import type { AgentConfig } from "@/agent-registry/agents";
import { AI_AGENTS } from "@/agent-registry/agents";

export function useConversationAgents(
  conversation: Conversation | null | undefined,
  isMultiAgentMode: boolean,
) {
  const [conversationAgents, setConversationAgents] = useState<AgentConfig[]>(
    [],
  );
  const [singleAgent, setSingleAgent] = useState<AgentConfig | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!conversation) {
      setConversationAgents([]);
      if (!isMultiAgentMode) {
        setSingleAgent(undefined);
      }
      return;
    }

    if (!isMultiAgentMode) {
      setSingleAgent(undefined);
    }

    const loadConversationAgents = async () => {
      try {
        const members = await conversation.members();
        const memberAddresses = new Set(
          members.flatMap((member) =>
            member.accountIdentifiers
              .filter((id) => id.identifierKind === "Ethereum")
              .map((id) => id.identifier.toLowerCase()),
          ),
        );

        const agents = AI_AGENTS.filter((agent) =>
          memberAddresses.has(agent.address.toLowerCase()),
        );

        setConversationAgents(agents);

        if (!isMultiAgentMode && agents.length > 0) {
          setSingleAgent(agents[0]);
        } else if (!isMultiAgentMode && agents.length === 0) {
          setSingleAgent(undefined);
        }
      } catch (error) {
        console.error("[InputArea] Error loading conversation agents:", error);
        setConversationAgents([]);
        if (!isMultiAgentMode) {
          setSingleAgent(undefined);
        }
      }
    };

    void loadConversationAgents();
  }, [conversation, isMultiAgentMode]);

  return {
    conversationAgents,
    singleAgent,
    setSingleAgent,
  };
}
