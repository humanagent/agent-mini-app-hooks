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
      } else {
        console.log("[XMTP] Filtered denied conversation:", {
          id: conversation.id,
          type: conversation.constructor.name,
        });
      }
    } catch (error) {
      console.error("[XMTP] Error checking consent, allowing by default:", {
        id: conversation.id,
        error,
      });
      allowedList.push(conversation);
    }
  }

  console.log("[XMTP] Consent filter:", {
    total: conversations.length,
    allowed: allowedList.length,
    filtered: conversations.length - allowedList.length,
  });

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
      console.log("[XMTP] Refreshing conversations...");
      await client.conversations.sync();
      const allConversations = await client.conversations.list();

      console.log("[XMTP] Total conversations before filtering:", {
        count: allConversations.length,
        ids: allConversations.map((c) => c.id),
      });

      const uniqueConversations = Array.from(
        new Map(allConversations.map((c) => [c.id, c])).values(),
      );

      const allowedConversations = await filterAllowedConversations(
        uniqueConversations,
        client,
      );

      console.log("[XMTP] Conversations after filtering:", {
        allowed: allowedConversations.length,
        ids: allowedConversations.map((c) => c.id),
      });

      setConversations(allowedConversations);
    } catch (err) {
      console.error("[XMTP] Error refreshing conversations:", err);
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
                console.log(
                  "[XMTP] Streamed conversation is denied, filtering out:",
                  conversation.id,
                );
                setConversations((prev: Conversation[]) => {
                  const filtered = prev.filter((c) => c.id !== conversation.id);
                  return filtered;
                });
                return;
              }
            } catch (error) {
              console.error(
                "[XMTP] Error checking streamed conversation consent:",
                error,
              );
              console.log(
                "[XMTP] Filtering out conversation due to consent check error:",
                conversation.id,
              );
              setConversations((prev: Conversation[]) => {
                const filtered = prev.filter((c) => c.id !== conversation.id);
                return filtered;
              });
              return;
            }

            setConversations((prev: Conversation[]) => {
              const dedupedMap = new Map<string, Conversation>(
                prev.map((c) => [c.id, c]),
              );

              dedupedMap.set(conversation.id, conversation);

              return Array.from(dedupedMap.values());
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
