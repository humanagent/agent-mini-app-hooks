import { AnalyticsIcon } from "@ui/icons";
import { cn } from "@/src/utils";
import { useIsMobile } from "@hooks/use-mobile";

type FloatingRightNavToggleProps = {
  onClick: () => void;
  visible: boolean;
};

export function FloatingRightNavToggle({
  onClick,
  visible,
}: FloatingRightNavToggleProps) {
  const isMobile = useIsMobile();

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      className={cn(
        "fixed z-50 h-8 w-8 rounded",
        "bg-zinc-950/80 backdrop-blur-md border border-zinc-800",
        "shadow-lg hover:bg-zinc-950/90",
        "transition-colors duration-200",
        "touch-manipulation",
        "flex items-center justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        "active:scale-[0.97]",
        isMobile ? "md:hidden" : "hidden md:block",
      )}
      style={{
        top: "calc(1rem + env(safe-area-inset-top, 0px))",
        right: "calc(1rem + env(safe-area-inset-right, 0px))",
        padding: 0,
        margin: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      <AnalyticsIcon size={16} />
      <span className="sr-only">Toggle Transactions</span>
    </button>
  );
}
