import { useEffect, useState } from "react";
import type { Client } from "@xmtp/browser-sdk";
import type { AgentConfig } from "@/src/agents";
import { AI_AGENTS } from "@/src/agents";
import type { ContentTypes } from "./utils";
import { toError } from "./utils";

export function useAgentConversationAgents(
  conversationId: string | null | undefined,
  client: Client<ContentTypes> | null,
) {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client || !conversationId) {
      setAgents([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const loadAgents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const conversation =
          await client.conversations.getConversationById(conversationId);

        if (!conversation || !mounted) {
          if (mounted) {
            setAgents([]);
            setIsLoading(false);
          }
          return;
        }

        const members = await conversation.members();
        const memberAddresses = new Set(
          members.flatMap((member) =>
            member.accountIdentifiers
              .filter((id) => id.identifierKind === "Ethereum")
              .map((id) => id.identifier.toLowerCase()),
          ),
        );

        const foundAgents = AI_AGENTS.filter((agent) =>
          memberAddresses.has(agent.address.toLowerCase()),
        );

        if (mounted) {
          setAgents(foundAgents);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(toError(err));
          setIsLoading(false);
          setAgents([]);
        }
      }
    };

    void loadAgents();

    return () => {
      mounted = false;
    };
  }, [client, conversationId]);

  return {
    agents,
    isLoading,
    error,
  };
}
