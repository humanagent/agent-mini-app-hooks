import type { Client } from "@xmtp/browser-sdk";
import { createContext, useContext, useEffect, useState } from "react";
import { createXMTPClient } from "@/lib/xmtp/client";
import { getOrCreateEphemeralAccountKey } from "@/lib/xmtp/signer";

type XMTPClientContextValue = {
  client: Client | null;
  isLoading: boolean;
  error: Error | null;
};

const XMTPClientContext = createContext<XMTPClientContextValue>({
  client: null,
  isLoading: true,
  error: null,
});

export function XMTPClientProvider({ children }: { children: React.ReactNode }) {
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
        setIsLoading(true);
        setError(null);

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
        console.error("[XMTPClientProvider] Failed to initialize:", err);
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

  return (
    <XMTPClientContext.Provider value={{ client, isLoading, error }}>
      {children}
    </XMTPClientContext.Provider>
  );
}

export function useXMTPClient() {
  return useContext(XMTPClientContext);
}