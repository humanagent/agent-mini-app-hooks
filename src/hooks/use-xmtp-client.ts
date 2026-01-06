import type { Client } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { createXMTPClient, type ContentTypes } from "@/lib/xmtp/client";
import { getOrCreateEphemeralAccountKey } from "@/lib/xmtp/signer";

let globalClientPromise: Promise<Client<ContentTypes>> | null = null;
let globalClient: Client<ContentTypes> | null = null;
let isInitializing = false;
const subscribers = new Set<
  (client: Client<ContentTypes> | null, error: Error | null) => void
>();

function notifySubscribers(
  client: Client<ContentTypes> | null,
  error: Error | null,
) {
  subscribers.forEach((subscriber) => subscriber(client, error));
}

async function initializeClient(): Promise<Client<ContentTypes>> {
  if (globalClient) {
    console.log("[XMTP] Using existing global client");
    return globalClient;
  }

  if (isInitializing && globalClientPromise) {
    console.log(
      "[XMTP] Client initialization already in progress, waiting for existing promise...",
    );
    return globalClientPromise;
  }

  if (isInitializing) {
    console.warn(
      "[XMTP] Initialization flag set but no promise exists, waiting 100ms...",
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (globalClientPromise) {
      return globalClientPromise;
    }
    if (globalClient) {
      return globalClient;
    }
  }

  console.log("[XMTP] Starting new client initialization...");
  isInitializing = true;

  globalClientPromise = (async () => {
    try {
      console.log("[XMTP] Getting or creating ephemeral account key...");
      const accountKey = getOrCreateEphemeralAccountKey();
      console.log(
        "[XMTP] Account key obtained:",
        accountKey.slice(0, 10) + "...",
      );

      console.log("[XMTP] Creating XMTP client...");
      const xmtpClient = await createXMTPClient(accountKey);

      console.log("[XMTP] XMTP client initialization complete");
      globalClient = xmtpClient;
      isInitializing = false;
      globalClientPromise = null;
      notifySubscribers(xmtpClient, null);
      return xmtpClient;
    } catch (err) {
      console.error("[XMTP] Error initializing client:", err);
      isInitializing = false;
      globalClientPromise = null;
      const error = err instanceof Error ? err : new Error(String(err));
      notifySubscribers(null, error);
      throw error;
    }
  })();

  return globalClientPromise;
}

export function useXMTPClient() {
  const [client, setClient] = useState<Client<ContentTypes> | null>(
    globalClient,
  );
  const [isLoading, setIsLoading] = useState(!globalClient);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (globalClient) {
      console.log("[XMTP] Client already exists, using it");
      setClient(globalClient);
      setIsLoading(false);
      return;
    }

    console.log("[XMTP] useXMTPClient effect running");
    console.log(
      "[XMTP] Current state - globalClient:",
      !!globalClient,
      "globalClientPromise:",
      !!globalClientPromise,
      "isInitializing:",
      isInitializing,
      "subscribers:",
      subscribers.size,
    );
    setIsLoading(true);
    setError(null);

    const subscriber = (
      newClient: Client<ContentTypes> | null,
      newError: Error | null,
    ) => {
      console.log(
        "[XMTP] Subscriber notified - client:",
        !!newClient,
        "error:",
        !!newError,
      );
      setClient(newClient);
      setError(newError);
      setIsLoading(false);
    };

    subscribers.add(subscriber);
    console.log(
      "[XMTP] Subscriber added, total subscribers:",
      subscribers.size,
    );

    initializeClient().catch((err) => {
      console.error("[XMTP] Failed to initialize client:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    });

    return () => {
      subscribers.delete(subscriber);
      console.log("[XMTP] useXMTPClient cleanup running");
    };
  }, []);

  return { client, isLoading, error };
}
