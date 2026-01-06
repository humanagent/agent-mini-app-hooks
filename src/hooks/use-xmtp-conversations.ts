import type { Client, Conversation } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import type { ContentTypes } from "@/lib/xmtp/client";

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
      setConversations(allConversations);
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
        console.log("[XMTP] Initializing conversations...");
        setIsLoading(true);
        setError(null);

        console.log("[XMTP] Syncing conversations...");
        await client.conversations.sync();
        console.log("[XMTP] Conversations sync complete");

        console.log("[XMTP] Listing conversations...");
        const allConversations = await client.conversations.list();
        console.log("[XMTP] Found conversations:", allConversations.length);

        if (mounted) {
          setConversations(allConversations);
          setIsLoading(false);
          console.log("[XMTP] Conversations state updated");
        }

        const stream = await client.conversations.stream({
          onValue: (conversation) => {
            if (mounted) {
              setConversations((prev) => {
                const exists = prev.some((c) => c.id === conversation.id);
                if (exists) {
                  return prev.map((c) =>
                    c.id === conversation.id ? conversation : c,
                  );
                }
                return [...prev, conversation];
              });
            }
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
