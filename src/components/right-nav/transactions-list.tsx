import { CopyIcon, CheckIcon } from "@ui/icons";
import { useState, useCallback } from "react";
import { cn, formatTimeAgo, shortAddress } from "@/src/utils";
import type { Transaction } from "./types";

export function TransactionsList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyHash = useCallback(async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => {
        setCopiedHash(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

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

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => {
        const isCopiedHash = copiedHash === tx.hash;
        const isCopiedFrom = copiedAddress === tx.from;
        const isCopiedTo = copiedAddress === tx.to;
        return (
          <div
            key={tx.id}
            className="rounded border border-zinc-800 bg-zinc-950 p-3 hover:bg-zinc-900 hover:border-zinc-700 transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleCopyAddress(tx.from)}
                  className="flex items-center gap-2 mb-1 w-full text-left hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-[10px] text-muted-foreground">
                    From
                  </span>
                  <span className="text-xs font-mono text-foreground truncate flex items-center gap-1">
                    {shortAddress(tx.from)}
                    {isCopiedFrom ? (
                      <CheckIcon size={12} className="text-green-500" />
                    ) : (
                      <CopyIcon size={12} className="opacity-50" />
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyAddress(tx.to)}
                  className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-[10px] text-muted-foreground">To</span>
                  <span className="text-xs font-mono text-foreground truncate flex items-center gap-1">
                    {shortAddress(tx.to)}
                    {isCopiedTo ? (
                      <CheckIcon size={12} className="text-green-500" />
                    ) : (
                      <CopyIcon size={12} className="opacity-50" />
                    )}
                  </span>
                </button>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-xs font-semibold text-foreground">
                  {tx.amount} USDC
                </div>
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-medium",
                    tx.status === "success"
                      ? "bg-green-500/20 text-green-500"
                      : tx.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500",
                  )}
                >
                  {tx.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
              <span className="text-[10px] text-muted-foreground">
                {formatTimeAgo(tx.timestamp)}
              </span>
              <button
                type="button"
                onClick={() => handleCopyHash(tx.hash)}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {isCopiedHash ? (
                  <>
                    <CheckIcon size={12} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} />
                    <span className="font-mono">{tx.hash.slice(0, 10)}...</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
