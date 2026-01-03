"use client";

import { useEffect, useState } from "react";
import type { Client } from "@xmtp/browser-sdk";
import { getOrCreateEphemeralWallet } from "@/lib/xmtp/identity";
import { createXMTPClient } from "@/lib/xmtp/client";

export function useXMTPClient() {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("[useXMTPClient] Window not available, skipping initialization");
      return;
    }

    let mounted = true;
    console.log("[useXMTPClient] Starting client initialization");

    const init = async () => {
      try {
        console.log("[useXMTPClient] Setting loading state to true");
        setIsLoading(true);
        setError(null);

        console.log("[useXMTPClient] Waiting 100ms before initialization");
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("[useXMTPClient] Getting or creating ephemeral wallet");
        const wallet = getOrCreateEphemeralWallet();
        console.log("[useXMTPClient] Wallet address:", wallet.address);

        console.log("[useXMTPClient] Creating XMTP client...");
        const xmtpClient = await createXMTPClient(wallet);
        console.log("[useXMTPClient] XMTP client created, inboxId:", xmtpClient.inboxId);

        if (mounted) {
          console.log("[useXMTPClient] Component still mounted, setting client state");
          setClient(xmtpClient);
          setIsLoading(false);
          console.log("[useXMTPClient] Client initialized successfully, state updated");
        } else {
          console.log("[useXMTPClient] Component unmounted, closing client");
          xmtpClient.close();
        }
      } catch (err) {
        console.error("[useXMTPClient] Failed to initialize:", err);
        console.error("[useXMTPClient] Error details:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          console.log("[useXMTPClient] Error state set, isLoading set to false");
        }
      }
    };

    init();

    return () => {
      console.log("[useXMTPClient] Cleanup: unmounting");
      mounted = false;
      if (client) {
        console.log("[useXMTPClient] Cleanup: closing client");
        client.close();
      }
    };
  }, []);

  return { client, isLoading, error };
}

