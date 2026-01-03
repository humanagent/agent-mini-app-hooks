import type { Client } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { createXMTPClient } from "@/lib/xmtp/client";
import { getOrCreateEphemeralAccountKey } from "@/lib/xmtp/signer";

export function useXMTPClient() {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let mounted = true;
    let clientRef: Client | null = null;

    const init = async () => {
      try {
        console.log("[useXMTPClient] Starting XMTP client initialization...");
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("[useXMTPClient] Getting ephemeral account key...");
        const accountKey = getOrCreateEphemeralAccountKey();
        console.log("[useXMTPClient] Account key obtained:", accountKey.slice(0, 10) + "...");

        console.log("[useXMTPClient] Creating XMTP client...");
        const xmtpClient = await createXMTPClient(accountKey);
        clientRef = xmtpClient;

        console.log("[useXMTPClient] XMTP client created successfully");
        console.log("[useXMTPClient] Client inboxId:", xmtpClient.inboxId);
        console.log("[useXMTPClient] Client installationId:", xmtpClient.installationId);

        if (mounted) {
          console.log("[useXMTPClient] Setting client in state...");
          setClient(xmtpClient);
          setIsLoading(false);
          console.log("[useXMTPClient] Client initialization complete");
        } else {
          console.log("[useXMTPClient] Component unmounted, closing client");
          xmtpClient.close();
        }
      } catch (err) {
        console.error("[useXMTPClient] Failed to initialize:", err);
        if (err instanceof Error) {
          console.error("[useXMTPClient] Error message:", err.message);
          console.error("[useXMTPClient] Error stack:", err.stack);
        }
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
