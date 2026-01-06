import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MiniKit } from "@worldcoin/minikit-js";

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
