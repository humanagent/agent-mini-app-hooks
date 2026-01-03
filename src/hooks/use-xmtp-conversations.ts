import type { Client, Conversation } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";

export function useXMTPConversations(client: Client | null) {
  console.log("[useXMTPConversations] Hook called with client:", !!client);
  
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
      console.log("[useXMTPConversations] Refreshing conversations list");
      await client.conversations.sync();
      const allConversations = await client.conversations.list();
      console.log(
        "[useXMTPConversations] Refreshed conversations list",
        allConversations.length,
      );
      setConversations(allConversations);
    } catch (err) {
      console.error("[useXMTPConversations] Failed to refresh:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [client]);

  useEffect(() => {
    console.log("[useXMTPConversations] Effect triggered, client:", !!client);
    
    if (!client) {
      console.log("[useXMTPConversations] No client available, skipping initialization");
      return;
    }

    console.log("[useXMTPConversations] Client available, starting conversations initialization");
    console.log("[useXMTPConversations] Client inboxId:", client.inboxId);

    let mounted = true;
    let streamCleanup: (() => Promise<void>) | null = null;

    const init = async () => {
      try {
        console.log("[useXMTPConversations] Initializing conversations...");
        setIsLoading(true);
        setError(null);

        console.log("[useXMTPConversations] Syncing conversations...");
        await client.conversations.sync();
        console.log("[useXMTPConversations] Conversations sync complete");

        console.log("[useXMTPConversations] Listing conversations...");
        const allConversations = await client.conversations.list();
        console.log("[useXMTPConversations] Found", allConversations.length, "conversations");

        if (mounted) {
          setConversations(allConversations);
          setIsLoading(false);
          console.log("[useXMTPConversations] Conversations initialized successfully");
        }

        console.log("[useXMTPConversations] Starting conversation stream...");
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
        console.error("[useXMTPConversations] Failed to initialize:", err);
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
        streamCleanup().catch(console.error);
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
