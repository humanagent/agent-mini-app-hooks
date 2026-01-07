import { useXMTPClient } from "@hooks/use-xmtp-client";
import { CopyIcon, CheckIcon } from "@ui/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@ui/sidebar";
import { shortAddress } from "@/lib/utils";
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

  return (
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
          <span className="flex-1 truncate text-left" data-testid="user-email">
            {displayAddress}
          </span>
          {copied ? (
            <CheckIcon className="ml-auto shrink-0 text-green-500" size={16} />
          ) : (
            <CopyIcon className="ml-auto shrink-0" size={16} />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
