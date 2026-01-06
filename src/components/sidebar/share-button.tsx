import { Button } from "@ui/button";
import { ShareIcon } from "@ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import { cn, isWorldApp } from "@/lib/utils";

export function ShareButton({ className }: { className?: string }) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!isWorldApp()) {
      return;
    }

    setIsSharing(true);
    try {
      await MiniKit.commandsAsync.chat({
        message: "Check out XMTP Agents - chat with AI agents on XMTP!",
      });
    } catch {
      // Error handling - user feedback handled by UI state
    } finally {
      setIsSharing(false);
    }
  };

  if (!isWorldApp()) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("h-8 px-2 md:h-fit md:px-2", className)}
          data-testid="share-button"
          disabled={isSharing}
          onClick={handleShare}
          variant="outline"
        >
          <ShareIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        Share via World Chat
      </TooltipContent>
    </Tooltip>
  );
}
