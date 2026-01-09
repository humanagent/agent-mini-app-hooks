import type { Client, Conversation } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import type { ContentTypes } from "@/lib/xmtp/client";
import { isConversationAllowed } from "@/lib/xmtp/consent";

async function filterAllowedConversations(
  conversations: Conversation[],
  client: Client<ContentTypes>,
): Promise<Conversation[]> {
  const allowedList: Conversation[] = [];

  for (const conversation of conversations) {
    try {
      const isAllowed = await isConversationAllowed(conversation, client);
      if (isAllowed) {
        allowedList.push(conversation);
      }
    } catch {
      // Allow by default on error
      allowedList.push(conversation);
    }
  }

  return allowedList;
}

export function useXMTPConversations(client: Client<ContentTypes> | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshConversations = useCallback(async () => {
    if (!client) {
      return;
    }

    try {
      await client.conversations.sync();
      const allConversations = await client.conversations.list();

      const uniqueConversations = Array.from(
        new Map(allConversations.map((c) => [c.id, c])).values(),
      );

      const allowedConversations = await filterAllowedConversations(
        uniqueConversations,
        client,
      );

      setConversations(allowedConversations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [client]);

  useEffect(() => {
    if (!client) {
      return;
    }

    let mounted = true;
    let streamCleanup: (() => Promise<void>) | null = null;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await client.conversations.sync();
        const allConversations = await client.conversations.list();

        if (mounted) {
          const uniqueConversations = Array.from(
            new Map(allConversations.map((c) => [c.id, c])).values(),
          );

          const allowedConversations = await filterAllowedConversations(
            uniqueConversations,
            client,
          );

          setConversations(allowedConversations);
          setIsLoading(false);
        }

        const stream = await client.conversations.stream({
          onValue: async (conversation) => {
            if (!mounted) return;

            try {
              const isAllowed = await isConversationAllowed(
                conversation,
                client,
              );
              if (!isAllowed) {
                setConversations((prev: Conversation[]) =>
                  prev.filter((c) => c.id !== conversation.id),
                );
                return;
              }
            } catch {
              setConversations((prev: Conversation[]) =>
                prev.filter((c) => c.id !== conversation.id),
              );
              return;
            }

            // Add conversation to list and re-filter to ensure blocked ones are removed
            setConversations((prev: Conversation[]) => {
              const dedupedMap = new Map<string, Conversation>(
                prev.map((c) => [c.id, c]),
              );

              dedupedMap.set(conversation.id, conversation);

              const updatedList = Array.from(dedupedMap.values());

              // Re-filter all conversations asynchronously to remove blocked ones
              void filterAllowedConversations(updatedList, client).then(
                (filtered) => {
                  if (mounted) {
                    setConversations(filtered);
                  }
                },
              );

              // Return updated list immediately (filtering happens async)
              return updatedList;
            });
          },
        });

        streamCleanup = async () => {
          await stream.end();
        };
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (streamCleanup) {
        void streamCleanup();
      }
    };
  }, [client]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    error,
    refreshConversations,
  };
}
