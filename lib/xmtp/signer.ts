import type { Signer } from "@xmtp/browser-sdk";
import { toBytes, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export type PrivateKey = Hex;

export const createEphemeralSigner = (privateKey: Hex): Signer => {
  console.log("[XMTP] Creating ephemeral signer...");
  const account = privateKeyToAccount(privateKey);
  console.log("[XMTP] Signer account address:", account.address);
  const signer = {
    type: "EOA" as const,
    getIdentifier: () => {
      const identifier = {
        identifier: account.address.toLowerCase(),
        identifierKind: "Ethereum" as const,
      };
      console.log("[XMTP] Signer getIdentifier called:", identifier);
      return identifier;
    },
    signMessage: async (message: string) => {
      console.log("[XMTP] Signing message...");
      const signature = await account.signMessage({
        message,
      });
      const signatureBytes = toBytes(signature);
      console.log(
        "[XMTP] Message signed, signature length:",
        signatureBytes.length,
      );
      return signatureBytes;
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
    console.log("[XMTP] Using cached ephemeral account key");
    return accountKeyCache;
  }

  const STORAGE_KEY = "xmtp-ephemeral-account-key";
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    console.log("[XMTP] Using stored ephemeral account key");
    accountKeyCache = stored as PrivateKey;
    return accountKeyCache;
  }

  console.log("[XMTP] Generating new ephemeral account key");
  const newKey = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, newKey);
  accountKeyCache = newKey;
  return newKey;
}
