import type { Client } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { createXMTPClient, type ContentTypes } from "@/lib/xmtp/client";
import { getOrCreateEphemeralAccountKey } from "@/lib/xmtp/signer";

export function useXMTPClient() {
  const [client, setClient] = useState<Client<ContentTypes> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let mounted = true;
    let clientRef: Client<ContentTypes> | null = null;

    const init = async () => {
      try {
        console.log("[XMTP] Initializing XMTP client...");
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("[XMTP] Getting or creating ephemeral account key...");
        const accountKey = getOrCreateEphemeralAccountKey();
        console.log("[XMTP] Account key created:", accountKey.slice(0, 10) + "...");

        console.log("[XMTP] Creating XMTP client...");
        const xmtpClient = await createXMTPClient(accountKey);
        clientRef = xmtpClient;
        console.log("[XMTP] XMTP client initialization complete");

        if (mounted) {
          setClient(xmtpClient);
          setIsLoading(false);
          console.log("[XMTP] Client state updated, ready to use");
        } else {
          console.log("[XMTP] Component unmounted, closing client");
          xmtpClient.close();
        }
      } catch (err) {
        console.error("[XMTP] Error initializing client:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (clientRef) {
        clientRef.close();
      }
    };
  }, []);

  return { client, isLoading, error };
}
