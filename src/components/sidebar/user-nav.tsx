import { useClient } from "@xmtp/use-client";
import { CopyIcon, CheckIcon, ResetIcon, ChevronDownIcon } from "@ui/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { shortAddress } from "@/src/utils";
import { clearEphemeralAccountKey } from "@xmtp/utils";
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
  const { client, isLoading } = useClient();
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isLoading}>
              <SidebarMenuButton
                className="h-9 bg-transparent border-2 border-zinc-900 hover:border-zinc-700 pl-3 pr-2 py-2 data-[active=true]:border-zinc-700 focus-visible:ring-0 focus:ring-0 focus:outline-none data-[state=open]:ring-0"
                data-testid="user-nav-button"
              >
                {isLoading ? (
                  <>
                    <Skeleton className="size-6 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <div
                      className="flex shrink-0 aspect-square size-6 items-center justify-center rounded text-white shadow-sm"
                      style={{ background: avatarGradient || "var(--accent)" }}
                    >
                      <span className="text-xs font-semibold drop-shadow-sm">
                        {initial}
                      </span>
                    </div>
                    <span
                      className="flex-1 truncate text-left min-w-0 self-center leading-none"
                      data-testid="user-email"
                    >
                      {displayAddress}
                    </span>
                    <div className="ml-auto shrink-0 flex items-center justify-center group-data-[collapsible=icon]:hidden">
                      <ChevronDownIcon
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={0}
              alignOffset={0}
              className="w-[calc(var(--sidebar-width)-1rem)] border-0 shadow-none rounded-b-none"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs">
                {displayAddress}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyAddress} className="w-full">
                {copied ? (
                  <CheckIcon className="text-green-500" size={16} />
                ) : (
                  <CopyIcon size={16} />
                )}
                <span>{copied ? "Copied!" : "Copy address"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setShowResetDialog(true);
                }}
                className="w-full text-destructive focus:text-destructive"
              >
                <ResetIcon size={16} />
                <span>Reset identity</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
