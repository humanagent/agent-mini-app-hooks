"use client";

import { useEffect, useState } from "react";
import type { Client, Conversation, Dm } from "@xmtp/browser-sdk";
import { findOrCreateDmWithAddress } from "@/lib/xmtp/conversations";

const FIXED_AGENT_ADDRESS = "0x194c31cae1418d5256e8c58e0d08aee1046c6ed0";

export function useXMTPConversations(client: Client | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

        console.log("[useXMTPConversations] Initializing conversations...");

        await client.conversations.sync();
        console.log("[useXMTPConversations] Synced conversations");

        const fixedDm = await findOrCreateDmWithAddress(client, FIXED_AGENT_ADDRESS);
        console.log("[useXMTPConversations] Created/found fixed conversation:", fixedDm.id);

        const allConversations = await client.conversations.list();
        console.log("[useXMTPConversations] Loaded conversations:", allConversations.length);

        if (mounted) {
          setConversations(allConversations);
          setSelectedConversation(fixedDm);
          setIsLoading(false);
        }

        const stream = await client.conversations.stream({
          onValue: (conversation) => {
            console.log("[useXMTPConversations] New conversation received:", conversation.id);
            if (mounted) {
              setConversations((prev) => {
                const exists = prev.some((c) => c.id === conversation.id);
                if (exists) {
                  return prev.map((c) => (c.id === conversation.id ? conversation : c));
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
  };
}

