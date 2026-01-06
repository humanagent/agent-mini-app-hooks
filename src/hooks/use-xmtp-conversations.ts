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
      // Deduplicate conversations by ID
      const uniqueConversations = Array.from(
        new Map(allConversations.map((c) => [c.id, c])).values(),
      );
      setConversations(uniqueConversations);
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
        console.log(
          "[XMTP] Conversation IDs:",
          allConversations.map((c) => c.id),
        );
        console.log(
          "[XMTP] Conversation details:",
          allConversations.map((c) => ({
            id: c.id,
            type: c.constructor.name,
            peerInboxId: "peerInboxId" in c ? c.peerInboxId : "N/A",
          })),
        );

        // Check for duplicates
        const uniqueIds = new Set(allConversations.map((c) => c.id));
        if (uniqueIds.size !== allConversations.length) {
          const duplicateIds = allConversations
            .map((c) => c.id)
            .filter((id, index, arr) => arr.indexOf(id) !== index);
          console.warn("[XMTP] Found duplicate conversation IDs:", {
            total: allConversations.length,
            unique: uniqueIds.size,
            duplicates: allConversations.length - uniqueIds.size,
            duplicateIds: [...new Set(duplicateIds)],
          });
        }

        if (mounted) {
          // Deduplicate conversations by ID
          const uniqueConversations = Array.from(
            new Map(allConversations.map((c) => [c.id, c])).values(),
          );
          setConversations(uniqueConversations);
          setIsLoading(false);
          console.log(
            "[XMTP] Conversations state updated with",
            uniqueConversations.length,
            "unique conversations",
          );
        }

        const stream = await client.conversations.stream({
          onValue: (conversation) => {
            if (mounted) {
              setConversations((prev) => {
                // First, ensure prev has no duplicates
                const dedupedPrev = Array.from(
                  new Map(prev.map((c) => [c.id, c])).values(),
                );

                const exists = dedupedPrev.some(
                  (c) => c.id === conversation.id,
                );
                console.log("[XMTP] Stream conversation:", {
                  id: conversation.id,
                  exists,
                  prevCount: dedupedPrev.length,
                });

                if (exists) {
                  // Update existing conversation
                  const updated = dedupedPrev.map((c) =>
                    c.id === conversation.id ? conversation : c,
                  );
                  // Final deduplication pass to be safe
                  return Array.from(
                    new Map(updated.map((c) => [c.id, c])).values(),
                  );
                }

                // Add new conversation and deduplicate
                const withNew = [...dedupedPrev, conversation];
                return Array.from(
                  new Map(withNew.map((c) => [c.id, c])).values(),
                );
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
