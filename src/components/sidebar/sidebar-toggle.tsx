import { Button } from "@ui/button";
import { SidebarLeftIcon } from "@ui/icons";
import { useSidebar, type SidebarTrigger } from "@ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import type { ComponentProps } from "react";
import { cn } from "@/src/utils";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "h-8 w-8 p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2",
            className,
          )}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="outline"
        >
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
