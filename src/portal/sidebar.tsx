import { useLocation, useNavigate } from "react-router";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarUI,
  useSidebar,
} from "@ui/sidebar";
import { CodeIcon, AnalyticsIcon, HelpIcon } from "@ui/icons";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { cn } from "@/lib/utils";

const SidebarLogo = ({ className }: { className?: string }) => (
  <img
    src="/icon.svg"
    alt="XMTP Agents"
    className={cn(
      "size-10 rounded p-2 hover:bg-zinc-800 transition-colors duration-200",
      className,
    )}
  />
);


export function PortalSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarUI className="group-data-[side=left]:border-r-0" collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
            <SidebarLogo className="group-data-[collapsible=icon]:hidden" />
            <SidebarToggle />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/dev-portal/help"}
              tooltip="Help"
            >
              <button
                type="button"
                onClick={() => handleNavClick("/dev-portal/help")}
                className="w-full"
              >
                <HelpIcon size={16} />
                <span className="group-data-[collapsible=icon]:hidden">
                  Help
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/dev-portal"}
              tooltip="My Agents"
            >
              <button
                type="button"
                onClick={() => handleNavClick("/dev-portal")}
                className="w-full"
              >
                <CodeIcon size={16} />
                <span className="group-data-[collapsible=icon]:hidden">
                  My Agents
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/dev-portal/analytics"}
              tooltip="Analytics"
            >
              <button
                type="button"
                onClick={() => handleNavClick("/dev-portal/analytics")}
                className="w-full"
              >
                <AnalyticsIcon size={16} />
                <span className="group-data-[collapsible=icon]:hidden">
                  Analytics
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarUI>
  );
}
