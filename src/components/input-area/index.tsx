import { useIsMobile } from "@hooks/use-mobile";
import { Button } from "@ui/button";
import { ArrowUpIcon, PlusIcon } from "@ui/icons";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { type AgentConfig, AI_AGENTS } from "@xmtp/agents";
import { cn } from "@/src/utils";
import { PlusPanel } from "./plus-panel";
import { AgentChips } from "./agent-chips";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from "./prompt-input";
import { AddAgentDialog } from "./dialogs/add-agent-dialog";
import { RemoveAgentDialog } from "./dialogs/remove-agent-dialog";
import { useConversationMembers } from "@xmtp/use-conversation-members";
import { useClient } from "@xmtp/use-client";
import { matchAgentsFromMembers } from "@lib/agent-utils";
import { useAgentManagement } from "./hooks/use-agent-management";
import { shuffleArray, appendAgentMentions } from "./utils";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentAt?: Date;
  sending?: boolean;
};

export function InputArea({
  selectedAgents,
  setSelectedAgents,
  sendMessage,
  conversation,
  openAgentsDialog,
  onOpenAgentsDialogChange,
}: {
  selectedAgents?: AgentConfig[];
  setSelectedAgents?: (agents: AgentConfig[]) => void;
  sendMessage?: (content: string, agents?: AgentConfig[]) => void;
  conversation?: Conversation | null;
  openAgentsDialog?: boolean;
  onOpenAgentsDialogChange?: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [plusPanelOpen, setPlusPanelOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const isGroup = conversation instanceof Group;
  const isMobile = useIsMobile();
  const { client } = useClient();

  // Determine modes
  // Chat Area Mode: selectedAgents provided AND conversation is null/undefined (conversation not started)
  // Message List Mode: conversation provided AND selectedAgents not provided (conversation ongoing)
  const isChatAreaMode =
    selectedAgents !== undefined && setSelectedAgents !== undefined;
  const isMessageListMode =
    conversation !== undefined && selectedAgents === undefined;
  // Multi-agent mode: use props (for chat area)
  const isMultiAgentMode = isChatAreaMode;

  // Initialize live agents
  const [liveAgents] = useState(() =>
    shuffleArray(AI_AGENTS.filter((agent) => agent.live)),
  );

  // Load conversation members and match agents
  const { members: conversationMembers } = useConversationMembers(
    conversation?.id || null,
    client,
  );
  const conversationAgents = matchAgentsFromMembers(
    conversationMembers,
    AI_AGENTS,
  );

  // State for single agent (can be set when adding agent before conversation exists)
  const [singleAgentState, setSingleAgentState] = useState<
    AgentConfig | undefined
  >(undefined);

  // Determine single agent for non-multi-agent mode
  const singleAgent = useMemo(() => {
    if (isMultiAgentMode) {
      return undefined;
    }
    // Use state if set (for chat area mode before conversation exists)
    if (singleAgentState) {
      return singleAgentState;
    }
    // Otherwise use conversation agents or fallback to live agents
    if (conversationAgents.length > 0) {
      return conversationAgents[0];
    }
    if (liveAgents.length > 0) {
      return liveAgents[0];
    }
    return undefined;
  }, [isMultiAgentMode, singleAgentState, conversationAgents, liveAgents]);

  // Reset single agent state when conversation exists (message list mode)
  useEffect(() => {
    if (isMessageListMode && conversation) {
      setSingleAgentState(undefined);
    }
  }, [isMessageListMode, conversation]);

  // Agent management
  const {
    handleAddAgent,
    handleRemoveAgent,
    confirmAddAgentOpen,
    setConfirmAddAgentOpen,
    agentToAdd,
    isAddingAgent,
    handleConfirmAddAgent,
    confirmRemoveAgentOpen,
    setConfirmRemoveAgentOpen,
    agentToRemove,
    isRemovingAgent,
    handleConfirmRemoveAgent,
  } = useAgentManagement({
    conversation,
    isMultiAgentMode,
    isMessageListMode,
    isGroup,
    selectedAgents,
    setSelectedAgents,
    conversationAgents,
    setPlusPanelOpen,
    onOpenAgentsDialogChange,
    textareaRef,
    setSingleAgent: setSingleAgentState,
  });

  const effectiveSingleAgent = singleAgent;

  // In message list mode, show all conversation agents. In chat area mode, use selected agents or single agent
  const currentSelectedAgents: AgentConfig[] = isMultiAgentMode
    ? selectedAgents || []
    : isMessageListMode && conversationAgents.length > 0
      ? conversationAgents
      : effectiveSingleAgent
        ? [effectiveSingleAgent]
        : [];

  // Keyboard shortcut: CMD/CTRL + K to open plus panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPlusPanelOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setPlusPanelOpen(false);
        onOpenAgentsDialogChange?.(false);
      }
    };

    if (plusPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [plusPanelOpen, onOpenAgentsDialogChange]);

  // Sync openAgentsDialog prop with plusPanelOpen state
  useEffect(() => {
    if (openAgentsDialog) {
      setPlusPanelOpen(true);
      onOpenAgentsDialogChange?.(false); // Reset the external state
    }
  }, [openAgentsDialog, onOpenAgentsDialogChange]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmittingRef.current) {
      return;
    }

    const messageContent = input.trim();

    if (!messageContent || !sendMessage) {
      return;
    }

    if (isMultiAgentMode && currentSelectedAgents.length === 0) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const messageToSend = appendAgentMentions(
        messageContent,
        conversationAgents,
        currentSelectedAgents,
      );
      console.log(
        "[InputArea] Sending message:",
        messageToSend,
        "with agents:",
        currentSelectedAgents.map((a) => a.name),
      );
      sendMessage?.(
        messageToSend,
        currentSelectedAgents.length > 0 ? currentSelectedAgents : undefined,
      );
      setInput("");
    } catch (error) {
      console.error("[InputArea] Error in handleSubmit:", error);
      // Error handling - sendMessage callback handles errors
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    }
  };

  return (
    <div
      className={`relative flex w-full flex-col ${isMultiAgentMode ? "gap-2" : "gap-4"}`}
    >
      <div className="relative" ref={panelRef}>
        <PlusPanel
          open={plusPanelOpen}
          agents={liveAgents}
          selectedAgents={currentSelectedAgents}
          onSelectAgent={handleAddAgent}
        />
        <PromptInput
          className={`rounded border border-zinc-800 bg-black transition-all duration-200 focus-within:border-zinc-700 hover:border-zinc-700 ${isMultiAgentMode ? "p-2" : "p-3"}`}
          onSubmit={handleSubmit}
        >
          <div className="flex items-start gap-2">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "shrink-0 p-0 transition-colors duration-200 active:scale-[0.97]",
                plusPanelOpen
                  ? "text-foreground hover:text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                isMobile ? "h-10 w-10" : "h-8 w-8",
              )}
              onClick={() => setPlusPanelOpen((prev) => !prev)}
            >
              <PlusIcon size={isMobile ? 20 : 16} />
            </Button>
            <PromptInputTextarea
              className={`grow resize-none border-0! border-none! bg-transparent text-xs outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden ${isMultiAgentMode ? "px-1 py-1 min-h-[24px] max-h-[120px]" : "p-2"}`}
              placeholder="Send a message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              ref={textareaRef}
            />
          </div>
          <PromptInputToolbar className="border-top-0! border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
            <PromptInputTools className="gap-0 sm:gap-0.5">
              <AgentChips
                agents={currentSelectedAgents}
                onRemoveAgent={handleRemoveAgent}
                isMultiAgentMode={isMultiAgentMode}
                isMessageListMode={isMessageListMode}
                conversation={conversation}
              />
            </PromptInputTools>

            <div className="flex items-center gap-1">
              <PromptInputSubmit
                className={`rounded bg-zinc-800 text-foreground transition-all duration-200 hover:bg-zinc-700 active:scale-[0.97] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none ${isMobile ? "size-10" : isMultiAgentMode ? "size-7" : "size-8"}`}
                disabled={
                  !input.trim() ||
                  (isMultiAgentMode && currentSelectedAgents.length === 0)
                }
              >
                <ArrowUpIcon
                  size={isMobile ? 16 : isMultiAgentMode ? 12 : 14}
                />
              </PromptInputSubmit>
            </div>
          </PromptInputToolbar>
        </PromptInput>
      </div>
      <AddAgentDialog
        open={confirmAddAgentOpen}
        onOpenChange={setConfirmAddAgentOpen}
        agent={agentToAdd}
        isAdding={isAddingAgent}
        onConfirm={handleConfirmAddAgent}
      />
      <RemoveAgentDialog
        open={confirmRemoveAgentOpen}
        onOpenChange={setConfirmRemoveAgentOpen}
        agent={agentToRemove}
        isRemoving={isRemovingAgent}
        onConfirm={handleConfirmRemoveAgent}
      />
    </div>
  );
}
