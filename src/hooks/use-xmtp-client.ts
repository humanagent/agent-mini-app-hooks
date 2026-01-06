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
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const accountKey = getOrCreateEphemeralAccountKey();
        const xmtpClient = await createXMTPClient(accountKey);
        clientRef = xmtpClient;

        if (mounted) {
          setClient(xmtpClient);
          setIsLoading(false);
        } else {
          xmtpClient.close();
        }
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
      if (clientRef) {
        clientRef.close();
      }
    };
  }, []);

  return { client, isLoading, error };
}
