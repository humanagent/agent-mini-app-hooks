import { Button } from "@ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@ui/sheet";
import { useIsMobile } from "@hooks/use-mobile";
import { XIcon } from "@ui/icons";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { TransactionsList } from "./transactions-list";
import { PermissionsList } from "./permissions-list";
import { generateMockTransactions } from "./mock-transactions";
import { generateMockPermissions } from "./mock-permissions";
import type { Transaction, Permission } from "./types";
import type { AgentConfig } from "@/agent-registry/agents";

const RIGHT_NAV_WIDTH = "32rem";
const RIGHT_NAV_WIDTH_MOBILE = "36rem";

type RightNavProps = {
  conversation: Conversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAgent?: AgentConfig | null;
  activeTab?: "transactions" | "permissions";
  onTabChange?: (tab: "transactions" | "permissions") => void;
};

export function RightNav({
  conversation,
  open,
  onOpenChange,
  selectedAgent,
  activeTab: externalActiveTab,
  onTabChange,
}: RightNavProps) {
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [internalActiveTab, setInternalActiveTab] = useState<
    "transactions" | "permissions"
  >("transactions");

  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = onTabChange ?? setInternalActiveTab;

  useEffect(() => {
    if (!conversation || !(conversation instanceof Group)) {
      setTransactions([]);
      setPermissions([]);
      return;
    }

    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const members = await conversation.members();
        const memberAddresses = members
          .flatMap((member) =>
            member.accountIdentifiers
              .filter((id) => id.identifierKind === "Ethereum")
              .map((id) => id.identifier.toLowerCase()),
          )
          .filter((addr, index, arr) => arr.indexOf(addr) === index);

        if (memberAddresses.length >= 2) {
          const mockTransactions = generateMockTransactions(memberAddresses, 15);
          setTransactions(mockTransactions);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error("[RightNav] Error loading transactions:", error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTransactions();
  }, [conversation]);

  useEffect(() => {
    if (selectedAgent) {
      setIsLoadingPermissions(true);
      try {
        const mockPermissions = generateMockPermissions(selectedAgent.address);
        setPermissions(mockPermissions);
        setActiveTab("permissions");
      } catch (error) {
        console.error("[RightNav] Error loading permissions:", error);
        setPermissions([]);
      } finally {
        setIsLoadingPermissions(false);
      }
    } else {
      setPermissions([]);
    }
  }, [selectedAgent, setActiveTab]);

  if (!conversation || !(conversation instanceof Group)) {
    return null;
  }

  const mainContent = (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 -mx-4 px-4 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded transition-colors duration-200",
              activeTab === "transactions"
                ? "bg-zinc-800 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-zinc-900",
            )}
          >
            Transactions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("permissions")}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded transition-colors duration-200",
              activeTab === "permissions"
                ? "bg-zinc-800 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-zinc-900",
            )}
          >
            Permissions
          </button>
        </div>

        {activeTab === "transactions" && (
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">
                Transactions
              </h2>
              <p className="text-xs text-muted-foreground">
                USDC transactions on Worldchain
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                Loading transactions...
              </div>
            ) : (
              <TransactionsList transactions={transactions} />
            )}
          </div>
        )}

        {activeTab === "permissions" && (
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">
                Permissions
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedAgent
                  ? `Token allowances for ${selectedAgent.name}`
                  : "Select an agent to view permissions"}
              </p>
            </div>

            {isLoadingPermissions ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                Loading permissions...
              </div>
            ) : (
              <PermissionsList permissions={permissions} />
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[var(--sidebar-width)] bg-black p-0 text-foreground border-zinc-800 [&>button]:hidden"
          style={
            {
              "--sidebar-width": RIGHT_NAV_WIDTH_MOBILE,
            } as React.CSSProperties
          }
        >
          <div className="flex h-full flex-col bg-black">
            <SheetHeader className="border-b border-zinc-800 px-4 py-3">
              <SheetTitle className="text-sm">
                {activeTab === "transactions" ? "Transactions" : "Permissions"}
              </SheetTitle>
            </SheetHeader>
            {mainContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-10 hidden border-l border-zinc-800 bg-black md:block",
        "transition-[right] duration-150 ease-linear",
        open ? "right-0" : "right-[calc(var(--sidebar-width)*-1)]",
      )}
      style={
        {
          "--sidebar-width": RIGHT_NAV_WIDTH,
          width: RIGHT_NAV_WIDTH,
          top: "env(safe-area-inset-top, 0px)",
          bottom: "env(safe-area-inset-bottom, 0px)",
          height: "calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
        } as React.CSSProperties
      }
    >
      <div className="flex h-full flex-col bg-black">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {activeTab === "transactions" ? "Transactions" : "Permissions"}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded opacity-70 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 active:scale-[0.97]"
            >
              <XIcon size={16} />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
        {mainContent}
      </div>
    </div>
  );
}
