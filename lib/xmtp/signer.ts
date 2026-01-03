import type { Signer } from "@xmtp/browser-sdk";
import { toBytes, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const STORAGE_KEY = "xmtp_private_key";

export function getOrCreateEphemeralAccountKey(): Hex {
  if (typeof window === "undefined") {
    throw new Error(
      "getOrCreateEphemeralAccountKey can only be called in browser",
    );
  }

  // Try to get existing key from localStorage
  const storedKey = localStorage.getItem(STORAGE_KEY);
  if (storedKey) {
    return storedKey as Hex;
  }

  // Generate new key and store it
  const newKey = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, newKey);
  return newKey;
}

export function createEphemeralSigner(privateKey: Hex): Signer {
  const account = privateKeyToAccount(privateKey);

  const signer: Signer = {
    type: "EOA",
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
}
