import type { Client } from "@xmtp/browser-sdk";
import { useEffect, useRef, useState } from "react";
import { createXMTPClient, type ContentTypes } from "@/lib/xmtp/client";
import { getOrCreateEphemeralAccountKey } from "@/lib/xmtp/signer";

export function useXMTPClient() {
  const [client, setClient] = useState<Client<ContentTypes> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (initStartedRef.current) {
      console.log("[XMTP] Initialization already started, skipping...");
      return;
    }

    initStartedRef.current = true;
    console.log("[XMTP] useXMTPClient effect running, initStartedRef set to true");

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
        
        const clientPromise = createXMTPClient(accountKey);
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Client.create() timed out after 30 seconds"));
          }, 30000);
        });

        const xmtpClient = await Promise.race([clientPromise, timeoutPromise]);
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
        if (err instanceof Error) {
          console.error("[XMTP] Error name:", err.name);
          console.error("[XMTP] Error message:", err.message);
          console.error("[XMTP] Error stack:", err.stack);
        }
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      console.log("[XMTP] useXMTPClient cleanup running");
      mounted = false;
      initStartedRef.current = false;
      if (clientRef) {
        console.log("[XMTP] Closing client in cleanup");
        clientRef.close();
      }
    };
  }, []);

  return { client, isLoading, error };
}
