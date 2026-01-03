import type { HDNodeWallet } from "ethers";
import { Wallet } from "ethers";

const STORAGE_KEY = "xmtp-ephemeral-wallet";

export function getOrCreateEphemeralWallet(): HDNodeWallet {
  if (typeof window === "undefined") {
    throw new Error("Ephemeral wallet can only be created in browser environment");
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Wallet(parsed.privateKey) as unknown as HDNodeWallet;
    }
  } catch (error) {
    console.error("[XMTP] Failed to load stored wallet:", error);
  }

  console.log("[XMTP] Creating new ephemeral wallet");
  const wallet = Wallet.createRandom();
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      privateKey: wallet.privateKey,
      address: wallet.address,
    }));
  } catch (error) {
    console.error("[XMTP] Failed to store wallet:", error);
  }

  return wallet;
}

