import { useXMTPClient } from "@hooks/use-xmtp-client";
import { CopyIcon, CheckIcon, ResetIcon } from "@ui/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Button } from "@ui/button";
import { shortAddress } from "@/lib/utils";
import { clearEphemeralAccountKey } from "@/lib/xmtp/signer";
import { useState, useCallback, useMemo } from "react";

function generateGradient(address: string): string {
  // Generate two colors from the address for gradient
  const hash1 = parseInt(address.slice(2, 10), 16);
  const hash2 = parseInt(address.slice(10, 18), 16);

  const hue1 = hash1 % 360;
  const hue2 = hash2 % 360;

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 40%))`;
}

export function SidebarUserNav() {
  const { client } = useXMTPClient();
  const [copied, setCopied] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const address = client?.accountIdentifier?.identifier;
  const displayAddress = address
    ? shortAddress(address.toLowerCase())
    : "Guest";
  const initial = address ? address.substring(2, 3).toUpperCase() : "G";

  const avatarGradient = useMemo(() => {
    return address ? generateGradient(address) : undefined;
  }, [address]);

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  }, [address]);

  const handleResetIdentity = useCallback(async () => {
    console.log("[ResetIdentity] Starting identity reset...");

    clearEphemeralAccountKey();
    console.log("[ResetIdentity] Cleared identity from storage");

    if (client) {
      try {
        console.log("[ResetIdentity] Closing XMTP client...");
        await client.close();
        console.log("[ResetIdentity] Client closed");
      } catch (error) {
        console.error("[ResetIdentity] Error closing client:", error);
      }
    }

    console.log("[ResetIdentity] Refreshing page...");
    window.location.reload();
  }, [client]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="h-9 justify-between bg-transparent"
            data-testid="user-nav-button"
            onClick={handleCopyAddress}
          >
            <div
              className="flex aspect-square size-6 items-center justify-center rounded text-white shadow-sm"
              style={{ background: avatarGradient || "var(--accent)" }}
            >
              <span className="text-xs font-semibold drop-shadow-sm">
                {initial}
              </span>
            </div>
            <span
              className="flex-1 truncate text-left"
              data-testid="user-email"
            >
              {displayAddress}
            </span>
            <div className="ml-auto flex items-center gap-1 shrink-0">
              {copied ? (
                <CheckIcon className="text-green-500" size={16} />
              ) : (
                <CopyIcon size={16} />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResetDialog(true);
                }}
                className="ml-1 rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
                title="Reset identity"
              >
                <ResetIcon size={16} />
              </button>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset identity</DialogTitle>
            <DialogDescription>
              This will remove your current identity and create a new one. All
              your conversations and messages will be lost. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleResetIdentity}
            >
              Reset identity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
