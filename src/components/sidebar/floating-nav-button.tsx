import { Button } from "@ui/button";
import { SidebarLeftIcon } from "@ui/icons";
import { useSidebar } from "@ui/sidebar";
import { cn } from "@/lib/utils";

export function FloatingNavButton() {
  const { isMobile, toggleSidebar } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <Button
      className={cn(
        "fixed z-50 h-10 w-10 p-0 rounded",
        "bg-zinc-950/80 backdrop-blur-md border border-zinc-800",
        "shadow-lg hover:bg-zinc-950/90",
        "transition-colors duration-200",
        "touch-manipulation",
      )}
      style={{
        top: "calc(1rem + env(safe-area-inset-top, 0px))",
        left: "calc(1rem + env(safe-area-inset-left, 0px))",
      }}
      onClick={toggleSidebar}
      variant="ghost"
      type="button"
    >
      <SidebarLeftIcon size={20} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
