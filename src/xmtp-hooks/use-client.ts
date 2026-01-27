import type { Client, Signer } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";

import {
  createXMTPClient,
  getOrCreateEphemeralAccountKey,
  createEphemeralSigner,
  type ContentTypes,
  toError,
  type XMTPClientOptions,
} from "./utils";

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

async function initializeClient(
  signer?: Signer,
  options?: XMTPClientOptions,
): Promise<Client<ContentTypes>> {
  if (globalClient) {
    return globalClient;
  }

  if (isInitializing && globalClientPromise) {
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

  isInitializing = true;

  globalClientPromise = (async () => {
    try {
      let xmtpClient: Client<ContentTypes>;

      if (signer) {
        // Use custom signer
        xmtpClient = await createXMTPClient(signer, options);
      } else {
        // Default: ephemeral signer
        const accountKey = getOrCreateEphemeralAccountKey();
        const ephemeralSigner = createEphemeralSigner(accountKey);
        xmtpClient = await createXMTPClient(ephemeralSigner, options);
      }

      globalClient = xmtpClient;
      isInitializing = false;
      globalClientPromise = null;
      notifySubscribers(xmtpClient, null);
      return xmtpClient;
    } catch (err) {
      console.error("[XMTP] Error initializing client:", err);
      isInitializing = false;
      globalClientPromise = null;
      const error = toError(err);
      notifySubscribers(null, error);
      throw error;
    }
  })();

  return globalClientPromise;
}

export function useClient(signer?: Signer, options?: XMTPClientOptions) {
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
      setClient(globalClient);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const subscriber = (
      newClient: Client<ContentTypes> | null,
      newError: Error | null,
    ) => {
      setClient(newClient);
      setError(newError);
      setIsLoading(false);
    };

    subscribers.add(subscriber);

    initializeClient(signer, options).catch((err) => {
      console.error("[XMTP] Failed to initialize client:", err);
      setError(toError(err));
      setIsLoading(false);
    });

    return () => {
      subscribers.delete(subscriber);
    };
  }, [signer, options]);

  return { client, isLoading, error };
}
