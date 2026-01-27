import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MiniKit } from "@worldcoin/minikit-js";
import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function checkMiniKitInstalled(): boolean {
  const originalError = console.error;
  const originalWarn = console.warn;

  try {
    console.error = () => {};
    console.warn = () => {};

    const result = MiniKit.isInstalled();
    return result;
  } catch {
    return false;
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
}

export function isWorldApp(): boolean {
  return checkMiniKitInstalled();
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

/**
 * Checks if a string is an ENS domain
 */
export function isEnsDomain(value: string): boolean {
  return value.endsWith(".eth") && value.length > 4;
}

/**
 * Checks if a string is a valid Ethereum address
 */
export function isValidAddress(value: string): boolean {
  return isAddress(value);
}

/**
 * Resolves an ENS domain to an Ethereum address
 */
export async function resolveEnsName(
  ensName: string,
): Promise<string | null> {
  try {
    const client = createPublicClient({
      chain: mainnet,
      transport: http("https://ethereum.publicnode.com"),
    });

    const address = await client.getEnsAddress({
      name: ensName,
    });

    return address || null;
  } catch (error) {
    console.error(`Failed to resolve ENS name ${ensName}:`, error);
    return null;
  }
}

/**
 * Resolves an ENS domain or address to a normalized Ethereum address
 * Returns the address if already an address, or resolves ENS if it's a domain
 */
export async function resolveToAddress(
  input: string,
): Promise<string | null> {
  const trimmed = input.trim().toLowerCase();

  // If it's already a valid address, return it normalized
  if (isAddress(trimmed)) {
    return trimmed;
  }

  // If it's an ENS domain, resolve it
  if (isEnsDomain(trimmed)) {
    return await resolveEnsName(trimmed);
  }

  return null;
}
