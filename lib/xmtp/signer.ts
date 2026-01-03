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
      const signatureBytes = toBytes(signature);
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

export function getOrCreateEphemeralAccountKey(): PrivateKey {
  console.log("[getOrCreateEphemeralAccountKey] Starting...");
  
  if (typeof window === "undefined") {
    throw new Error(
      "Ephemeral account key can only be created in browser environment",
    );
  }

  // always generate a new ephemeral identity
  console.log("[getOrCreateEphemeralAccountKey] Generating new private key...");
  const accountKey = generatePrivateKey();
  console.log("[getOrCreateEphemeralAccountKey] Private key generated:", accountKey.slice(0, 10) + "...");

  return accountKey;
}
