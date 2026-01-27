import { useEffect, useState } from "react";
import type { Client, GroupMember } from "@xmtp/browser-sdk";
import type { ContentTypes } from "./utils";
import { toError } from "./utils";

export function useConversationMembers(
  conversationId: string | null | undefined,
  client: Client<ContentTypes> | null,
) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client || !conversationId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const loadMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const conversation =
          await client.conversations.getConversationById(conversationId);

        if (!conversation || !mounted) {
          if (mounted) {
            setMembers([]);
            setIsLoading(false);
          }
          return;
        }

        const conversationMembers = await conversation.members();

        if (mounted) {
          setMembers(conversationMembers);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(toError(err));
          setIsLoading(false);
          setMembers([]);
        }
      }
    };

    void loadMembers();

    return () => {
      mounted = false;
    };
  }, [client, conversationId]);

  return {
    members,
    isLoading,
    error,
  };
}
