import type { Signer } from "@xmtp/browser-sdk";
import { toBytes, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export type PrivateKey = Hex;

export const createEphemeralSigner = (privateKey: Hex): Signer => {
  const account = privateKeyToAccount(privateKey);
  const signer = {
    type: "EOA" as const,
    getIdentifier: () => {
      return {
        identifier: account.address.toLowerCase(),
        identifierKind: "Ethereum" as const,
      };
    },
    signMessage: async (message: string) => {
      const signature = await account.signMessage({
        message,
      });
      return toBytes(signature);
    },
  };
  return signer;
};

export const createEOASigner = (
  address: `0x${string}`,
  signMessage: (message: string) => Promise<string> | string,
): Signer => {
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await signMessage(message);
      return toBytes(signature);
    },
  };
};

export const createSCWSigner = (
  address: `0x${string}`,
  signMessage: (message: string) => Promise<string> | string,
  chainId: number = 1,
): Signer => {
  return {
    type: "SCW",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await signMessage(message);
      const signatureBytes = toBytes(signature);
      return signatureBytes;
    },
    getChainId: () => BigInt(chainId),
  };
};

let accountKeyCache: PrivateKey | null = null;

export function getOrCreateEphemeralAccountKey(): PrivateKey {
  if (typeof window === "undefined") {
    throw new Error(
      "Ephemeral account key can only be created in browser environment",
    );
  }

  if (accountKeyCache) {
    return accountKeyCache;
  }

  const STORAGE_KEY = "xmtp-ephemeral-account-key";
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    accountKeyCache = stored as PrivateKey;
    return accountKeyCache;
  }
  const newKey = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, newKey);
  accountKeyCache = newKey;
  return newKey;
}

export function clearEphemeralAccountKey(): void {
  console.log("[XMTP] Clearing ephemeral account key cache and storage");
  accountKeyCache = null;
  const STORAGE_KEY = "xmtp-ephemeral-account-key";
  localStorage.removeItem(STORAGE_KEY);
}
