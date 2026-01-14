import { CopyIcon, CheckIcon } from "@ui/icons";
import { Button } from "@ui/button";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Permission } from "./types";

function formatTimeAgo(date: Date): string {
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

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PermissionsList({ permissions }: { permissions: Permission[] }) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedTokenAddress, setCopiedTokenAddress] = useState<string | null>(null);

  const handleCopyAddress = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  const handleCopyTokenAddress = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedTokenAddress(address);
      setTimeout(() => {
        setCopiedTokenAddress(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  if (permissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
        No permissions found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {permissions.map((perm) => {
        const isCopiedSpender = copiedAddress === perm.spender;
        const isCopiedToken = copiedTokenAddress === perm.tokenAddress;
        return (
          <div
            key={perm.id}
            className="rounded border border-zinc-800 bg-zinc-950 p-3 hover:bg-zinc-900 hover:border-zinc-700 transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold text-foreground">{perm.token}</div>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-400",
                    )}
                  >
                    {perm.chain}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAddress(perm.spender)}
                  className="flex items-center gap-2 mb-1 w-full text-left hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-[10px] text-muted-foreground">Agent</span>
                  <span className="text-xs font-mono text-foreground truncate flex items-center gap-1">
                    {truncateAddress(perm.spender)}
                    {isCopiedSpender ? (
                      <CheckIcon size={12} className="text-green-500" />
                    ) : (
                      <CopyIcon size={12} className="opacity-50" />
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyTokenAddress(perm.tokenAddress)}
                  className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-[10px] text-muted-foreground">Token</span>
                  <span className="text-xs font-mono text-foreground truncate flex items-center gap-1">
                    {truncateAddress(perm.tokenAddress)}
                    {isCopiedToken ? (
                      <CheckIcon size={12} className="text-green-500" />
                    ) : (
                      <CopyIcon size={12} className="opacity-50" />
                    )}
                  </span>
                </button>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-xs font-semibold text-foreground">
                  {perm.allowance} {perm.token}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
              <span className="text-[10px] text-muted-foreground">
                Granted {formatTimeAgo(perm.grantedAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
