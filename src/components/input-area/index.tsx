import { Button } from "@ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Input } from "@ui/input";
import {
  ArrowUpIcon,
  PaperclipIcon,
  PlusIcon,
  XIcon,
  AddPeopleIcon,
  MetadataIcon,
  ShareIcon,
} from "@ui/icons";
import { Popover, PopoverAnchor, PopoverContent } from "@ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { AgentSelector } from "./agent-selector";
import { Textarea } from "@ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import {
  type ComponentProps,
  type HTMLAttributes,
  type KeyboardEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { AI_AGENTS, type AgentConfig } from "@/agent-registry/agents";
import { cn } from "@/lib/utils";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentAt?: Date;
};

type PromptInputProps = HTMLAttributes<HTMLFormElement>;

const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      "w-full overflow-hidden rounded border border-zinc-800 bg-black",
      className,
    )}
    {...props}
  />
);

type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
  disableAutoResize?: boolean;
  resizeOnNewLinesOnly?: boolean;
};

const PromptInputTextarea = ({
  onChange,
  onKeyDown,
  className,
  placeholder = "What would you like to know?",
  minHeight: _minHeight = 48,
  maxHeight: _maxHeight = 164,
  disableAutoResize = false,
  resizeOnNewLinesOnly = false,
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    onKeyDown?.(e);

    if (e.key === "Enter") {
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        "w-full resize-none rounded-none border-none p-3 shadow-none outline-hidden ring-0",
        disableAutoResize
          ? "field-sizing-fixed"
          : resizeOnNewLinesOnly
            ? "field-sizing-fixed"
            : "field-sizing-content max-h-[6lh]",
        "bg-transparent dark:bg-transparent",
        "focus-visible:ring-0",
        className,
      )}
      name="message"
      onChange={(e) => {
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <div
    className={cn("flex items-center justify-between p-1", className)}
    {...props}
  />
);

type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

const PromptInputTools = ({ className, ...props }: PromptInputToolsProps) => (
  <div
    className={cn(
      "flex items-center gap-1",
      "[&_button:first-child]:rounded-bl-xl",
      className,
    )}
    {...props}
  />
);

type PromptInputSubmitProps = ComponentProps<typeof Button>;

const PromptInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  children,
  ...props
}: PromptInputSubmitProps) => {
  return (
    <Button
      className={cn("gap-1.5 rounded", className)}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function AddPeopleDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}) {
  const [address, setAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshConversations } = useConversationsContext();

  const handleAdd = async () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError("Address is required");
      return;
    }

    if (!isValidEthereumAddress(trimmedAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    setError(null);
    setIsAdding(true);

    try {
      console.log("[AddPeople] Adding member:", trimmedAddress);
      await group.addMembersByIdentifiers([
        {
          identifier: trimmedAddress.toLowerCase(),
          identifierKind: "Ethereum" as const,
        },
      ]);
      console.log("[AddPeople] Member added successfully");
      setAddress("");
      onOpenChange(false);
      void refreshConversations();
    } catch (err) {
      console.error("[AddPeople] Error adding member:", err);
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add people to group</DialogTitle>
          <DialogDescription>
            Enter an Ethereum address to add to this group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="0x..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isAdding) {
                void handleAdd();
              }
            }}
            disabled={isAdding}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isAdding || !address.trim()}>
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetadataDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}) {
  const [metadata, setMetadata] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      void (async () => {
        setIsLoading(true);
        try {
          console.log("[Metadata] Fetching group metadata");
          const members = await group.members();
          const groupData = {
            id: group.id,
            name: group.name,
            description: group.description,
            members: members.map((member) => ({
              inboxId: member.inboxId,
              accountIdentifiers: member.accountIdentifiers,
              installationIds: member.installationIds,
              permissionLevel: member.permissionLevel,
              consentState: member.consentState,
            })),
          };
          setMetadata(JSON.stringify(groupData, null, 2));
          console.log("[Metadata] Group metadata fetched successfully");
        } catch (err) {
          console.error("[Metadata] Error fetching metadata:", err);
          setMetadata(
            JSON.stringify(
              {
                error:
                  err instanceof Error
                    ? err.message
                    : "Failed to fetch metadata",
              },
              null,
              2,
            ),
          );
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [open, group]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Group Metadata</DialogTitle>
          <DialogDescription>
            JSON details of the group including id, members, name, and
            description.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading metadata...
            </div>
          ) : (
            <pre className="flex-1 min-h-0 overflow-auto rounded border border-zinc-800 bg-zinc-950 p-4 text-[10px]">
              <code className="block whitespace-pre-wrap break-words">
                {metadata || "No data available"}
              </code>
            </pre>
          )}
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InputArea({
  selectedAgents,
  setSelectedAgents,
  sendMessage,
  messages: _messages,
  conversation,
  openAgentsDialog,
  onOpenAgentsDialogChange,
}: {
  selectedAgents?: AgentConfig[];
  setSelectedAgents?: (agents: AgentConfig[]) => void;
  sendMessage?: (content: string, agents?: AgentConfig[]) => void;
  messages?: Message[];
  conversation?: Conversation | null;
  openAgentsDialog?: boolean;
  onOpenAgentsDialogChange?: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [internalOpenDialog, setInternalOpenDialog] = useState(false);
  const openDialog = openAgentsDialog ?? internalOpenDialog;
  const setOpenDialog = onOpenAgentsDialogChange ?? setInternalOpenDialog;
  const [openPopover, setOpenPopover] = useState(false);
  const [addPeopleOpen, setAddPeopleOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [conversationAgents, setConversationAgents] = useState<AgentConfig[]>(
    [],
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const lastEnterPressRef = useRef<number>(0);
  const isGroup = conversation instanceof Group;

  // Keyboard shortcut: CMD/CTRL + K to open agent selector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenDialog(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpenDialog]);

  // Determine context mode:
  // Chat Area Mode: selectedAgents provided AND conversation is null/undefined (conversation not started)
  // Message List Mode: conversation provided AND selectedAgents not provided (conversation ongoing)
  const isChatAreaMode =
    selectedAgents !== undefined && setSelectedAgents !== undefined;
  const isMessageListMode =
    conversation !== undefined && selectedAgents === undefined;

  console.log("[InputArea] Mode detection:", {
    hasSelectedAgents: selectedAgents !== undefined,
    hasSetSelectedAgents: setSelectedAgents !== undefined,
    hasConversation: conversation !== undefined,
    isChatAreaMode,
    isMessageListMode,
    conversationId: conversation?.id,
  });

  // Multi-agent mode: use props (for chat area)
  // Single-agent mode: use internal state (for message list)
  const isMultiAgentMode = isChatAreaMode;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [liveAgents] = useState(() =>
    shuffleArray(AI_AGENTS.filter((agent) => agent.live)),
  );

  const [singleAgent, setSingleAgent] = useState<AgentConfig | undefined>(
    () => {
      if (!isMultiAgentMode && liveAgents.length > 0) {
        return liveAgents[0];
      }
      return undefined;
    },
  );

  const currentSelectedAgents = isMultiAgentMode
    ? selectedAgents
    : singleAgent
      ? [singleAgent]
      : [];

  useEffect(() => {
    if (!conversation) {
      setConversationAgents([]);
      if (!isMultiAgentMode) {
        setSingleAgent(undefined);
      }
      return;
    }

    if (!isMultiAgentMode) {
      setSingleAgent(undefined);
    }

    const loadConversationAgents = async () => {
      try {
        console.log(
          "[InputArea] Loading conversation agents for conversation:",
          conversation.id,
        );
        const members = await conversation.members();
        const memberAddresses = new Set(
          members.flatMap((member) =>
            member.accountIdentifiers
              .filter((id) => id.identifierKind === "Ethereum")
              .map((id) => id.identifier.toLowerCase()),
          ),
        );

        console.log(
          "[InputArea] Member addresses:",
          Array.from(memberAddresses),
        );

        const agents = AI_AGENTS.filter((agent) =>
          memberAddresses.has(agent.address.toLowerCase()),
        );

        console.log(
          "[InputArea] Found agents:",
          agents.map((a) => a.name),
        );

        setConversationAgents(agents);

        if (!isMultiAgentMode && agents.length > 0) {
          console.log("[InputArea] Setting singleAgent to:", agents[0].name);
          setSingleAgent(agents[0]);
        } else if (!isMultiAgentMode && agents.length === 0) {
          console.log(
            "[InputArea] No agents found in conversation, clearing singleAgent",
          );
          setSingleAgent(undefined);
        }
      } catch (error) {
        console.error("[InputArea] Error loading conversation agents:", error);
        setConversationAgents([]);
        if (!isMultiAgentMode) {
          setSingleAgent(undefined);
        }
      }
    };

    void loadConversationAgents();
  }, [conversation, isMultiAgentMode]);

  const suggestedActions = useMemo(() => {
    if (currentSelectedAgents.length === 0) {
      return [];
    }

    const allSuggestions: string[] = currentSelectedAgents
      .flatMap((agent) => agent.suggestions || [])
      .filter((suggestion): suggestion is string => Boolean(suggestion));

    if (allSuggestions.length === 0) {
      return [];
    }

    const shuffled = shuffleArray(allSuggestions);
    return shuffled.slice(0, 4);
  }, [currentSelectedAgents]);

  const handleAddAgent = (agent: AgentConfig) => {
    if (isMultiAgentMode) {
      const agents = selectedAgents;
      const setAgents = setSelectedAgents as (agents: AgentConfig[]) => void;
      // Replace instead of add - single select
      setAgents([agent]);
    } else {
      console.log(
        "[InputArea] handleAddAgent called in single-agent mode with agent:",
        agent.name,
      );
      console.log("[InputArea] Current conversation:", conversation?.id);
      if (conversation) {
        console.log(
          "[InputArea] Conversation exists, agent should be derived from conversation members, not modal selection",
        );
        setOpenDialog(false);
        textareaRef.current?.focus();
        return;
      }
      console.log(
        "[InputArea] No conversation, setting singleAgent to:",
        agent.name,
      );
      setSingleAgent(agent);
      setOpenDialog(false);
      textareaRef.current?.focus();
    }
    setOpenPopover(false);
  };

  const handleAgentSelect = (agent: AgentConfig) => {
    handleAddAgent(agent);
    setOpenDialog(false);
    textareaRef.current?.focus();
  };

  const handleRemoveAgent = (address: string) => {
    if (isMultiAgentMode) {
      const agents = selectedAgents;
      const setAgents = setSelectedAgents as (agents: AgentConfig[]) => void;
      setAgents(agents.filter((a) => a.address !== address));
    }
  };

  const appendAgentMentions = (message: string): string => {
    // Use conversationAgents if available (existing conversation), otherwise use selected agents
    const agentsToMention =
      conversationAgents.length > 0
        ? conversationAgents
        : currentSelectedAgents;

    if (agentsToMention.length === 0) {
      return message;
    }
    const mentions = agentsToMention.map((agent) => `@${agent.name}`).join(" ");
    return `${message} ${mentions}`;
  };

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
      const messageToSend = appendAgentMentions(messageContent);
      console.log("[InputArea] Sending message with mentions:", messageToSend);
      sendMessage?.(
        messageToSend,
        isMultiAgentMode ? currentSelectedAgents : undefined,
      );
      setInput("");
    } catch {
      // Error handling - sendMessage callback handles errors
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (sendMessage) {
      const messageToSend = appendAgentMentions(suggestion);
      console.log(
        "[InputArea] Sending suggestion with mentions:",
        messageToSend,
      );
      sendMessage(
        messageToSend,
        isMultiAgentMode ? currentSelectedAgents : undefined,
      );
    }
  };

  return (
    <div
      className={`relative flex w-full flex-col ${isMultiAgentMode ? "gap-2" : "gap-4"}`}
    >
      {suggestedActions.length > 0 &&
        !input.trim() &&
        isChatAreaMode &&
        !conversation && (
          <div className="grid w-full gap-2 sm:grid-cols-2">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                initial={{ opacity: 0, y: 10 }}
                key={suggestedAction}
                transition={{ delay: 0.05 * index, duration: 0.15 }}
              >
                <Button
                  className="h-auto w-full whitespace-normal p-3 text-left"
                  onClick={() => {
                    handleSuggestionClick(suggestedAction);
                  }}
                  type="button"
                  variant="outline"
                >
                  {suggestedAction}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      <Popover
        open={openPopover && isMultiAgentMode}
        onOpenChange={setOpenPopover}
      >
        <PromptInput
          className={`rounded border border-zinc-800 bg-black transition-all duration-200 focus-within:border-zinc-700 hover:border-zinc-700 ${isMultiAgentMode ? "p-2" : "p-3"}`}
          onSubmit={handleSubmit}
        >
          <PopoverAnchor asChild>
            <div
              className={`flex flex-row ${isMultiAgentMode ? "items-center" : "items-start"} gap-1 sm:gap-2`}
            >
              {isMultiAgentMode ? (
                <>
                  <AgentSelector
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    agents={liveAgents}
                    selectedAgents={currentSelectedAgents}
                    onSelectAgent={handleAgentSelect}
                    title="Add Agent"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-7 w-7 p-0 shrink-0"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setOpenDialog(true);
                        }}
                      >
                        <PlusIcon size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="flex items-center gap-1.5"
                    >
                      <span>Add agent</span>
                      <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium inline-flex">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Button
                  className="h-8 p-1 md:h-fit md:p-2"
                  type="button"
                  variant="ghost"
                >
                  <PaperclipIcon size={16} />
                </Button>
              )}
              <PromptInputTextarea
                className={`grow resize-none border-0! border-none! bg-transparent text-xs outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden ${isMultiAgentMode ? "px-1 py-1 min-h-[24px] max-h-[120px]" : "p-2"}`}
                placeholder="Send a message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (isMultiAgentMode && e.key === "@") {
                    setOpenPopover(true);
                  }
                }}
              />
            </div>
          </PopoverAnchor>
          <PromptInputToolbar className="border-top-0! border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
            <PromptInputTools className="gap-0 sm:gap-0.5">
              {isMultiAgentMode ? (
                <>
                  <AnimatePresence mode="popLayout">
                    {currentSelectedAgents.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 overflow-hidden"
                      >
                        {currentSelectedAgents.map((agent) => (
                          <motion.div
                            key={agent.address}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-foreground h-6"
                          >
                            {agent.image ? (
                              <img
                                alt={agent.name}
                                className="h-4 w-4 shrink-0 rounded object-cover"
                                src={agent.image}
                              />
                            ) : (
                              <div className="h-4 w-4 shrink-0 rounded bg-muted" />
                            )}
                            <span>{agent.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveAgent(agent.address);
                              }}
                              className="rounded hover:bg-zinc-700 p-0.5 transition-colors duration-200 active:scale-[0.97]"
                            >
                              <XIcon size={12} />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <AgentSelector
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    agents={liveAgents}
                    selectedAgents={currentSelectedAgents}
                    onSelectAgent={handleAgentSelect}
                    title="Select Agent"
                  />
                  <Button
                    className="h-7 w-[200px] justify-between gap-2 px-2"
                    variant="ghost"
                    onClick={() => {
                      setOpenDialog(true);
                    }}
                  >
                    {singleAgent?.image ? (
                      <img
                        alt={singleAgent.name}
                        className="h-5 w-5 shrink-0 rounded object-cover"
                        src={singleAgent.image}
                      />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded bg-muted" />
                    )}
                    <span className="flex-1 truncate text-left">
                      {singleAgent?.name || "Select agent"}
                    </span>
                  </Button>
                </>
              )}
            </PromptInputTools>

            <div className="flex items-center gap-1">
              {conversation && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`${isMultiAgentMode ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}`}
                      variant="ghost"
                      type="button"
                    >
                      <ShareIcon size={isMultiAgentMode ? 12 : 14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share conversation</TooltipContent>
                </Tooltip>
              )}
              {isGroup && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className={`${isMultiAgentMode ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}`}
                        variant="ghost"
                        type="button"
                        onClick={() => setAddPeopleOpen(true)}
                      >
                        <AddPeopleIcon size={isMultiAgentMode ? 12 : 14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add people to conversation</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className={`${isMultiAgentMode ? "h-7 w-7 p-0" : "h-8 w-8 p-0"}`}
                        variant="ghost"
                        type="button"
                        onClick={() => setMetadataOpen(true)}
                      >
                        <MetadataIcon size={isMultiAgentMode ? 12 : 14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View group metadata</TooltipContent>
                  </Tooltip>
                </>
              )}
              <PromptInputSubmit
                className={`rounded bg-accent text-accent-foreground transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_0_12px_rgba(207,28,15,0.4)] active:scale-[0.97] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none ${isMultiAgentMode ? "size-7" : "size-8"}`}
                disabled={
                  !input.trim() ||
                  (isMultiAgentMode && currentSelectedAgents.length === 0)
                }
              >
                <ArrowUpIcon size={isMultiAgentMode ? 12 : 14} />
              </PromptInputSubmit>
            </div>
          </PromptInputToolbar>
        </PromptInput>
        {isMultiAgentMode && (
          <PopoverContent
            className="w-[280px] p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
            side="top"
            align="start"
            sideOffset={8}
          >
            <Command>
              <CommandList>
                <CommandGroup heading="Agents in conversation">
                  {conversationAgents.map((agent) => {
                    const isSelected = currentSelectedAgents.some(
                      (a) => a.address === agent.address,
                    );
                    return (
                      <CommandItem
                        key={agent.address}
                        value={agent.name}
                        disabled={isSelected}
                        onSelect={() => {
                          if (!isSelected) {
                            handleAddAgent(agent);
                            setOpenPopover(false);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2",
                          isSelected && "opacity-50",
                        )}
                      >
                        {agent.image ? (
                          <img
                            alt={agent.name}
                            className="h-6 w-6 shrink-0 rounded object-cover"
                            src={agent.image}
                          />
                        ) : (
                          <div className="h-6 w-6 shrink-0 rounded bg-muted" />
                        )}
                        <span className="flex-1 truncate text-left">
                          {agent.name}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {conversationAgents.length === 0 && (
                  <CommandEmpty>No agents in conversation.</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      {isGroup && (
        <>
          <AddPeopleDialog
            open={addPeopleOpen}
            onOpenChange={setAddPeopleOpen}
            group={conversation}
          />
          <MetadataDialog
            open={metadataOpen}
            onOpenChange={setMetadataOpen}
            group={conversation}
          />
        </>
      )}
    </div>
  );
}
