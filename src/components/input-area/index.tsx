import { Button } from "@ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import { ArrowUpIcon, PaperclipIcon, PlusIcon, XIcon } from "@ui/icons";
import { Popover, PopoverAnchor, PopoverContent } from "@ui/popover";
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
import { AI_AGENTS, type AgentConfig } from "@/agent-registry/agents";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type PromptInputProps = HTMLAttributes<HTMLFormElement>;

const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      "w-full overflow-hidden rounded-md border bg-background",
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
      className={cn("gap-1.5 rounded-md", className)}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};

export function InputArea({
  selectedAgents,
  setSelectedAgents,
  sendMessage,
  messages: _messages,
  conversation,
}: {
  selectedAgents?: AgentConfig[];
  setSelectedAgents?: (agents: AgentConfig[]) => void;
  sendMessage?: (content: string, agents?: AgentConfig[]) => void;
  messages?: Message[];
  conversation?: Conversation | null;
}) {
  const [input, setInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [conversationAgents, setConversationAgents] = useState<AgentConfig[]>(
    [],
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const lastEnterPressRef = useRef<number>(0);

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
      if (agents.some((a) => a.address === agent.address)) {
        return;
      }
      setAgents([...agents, agent]);
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
    const now = Date.now();
    const timeSinceLastEnter = now - lastEnterPressRef.current;
    lastEnterPressRef.current = now;

    handleAddAgent(agent);

    if (timeSinceLastEnter < 500) {
      setOpenDialog(false);
      textareaRef.current?.focus();
    }
  };

  const handleRemoveAgent = (address: string) => {
    if (isMultiAgentMode) {
      const agents = selectedAgents;
      const setAgents = setSelectedAgents as (agents: AgentConfig[]) => void;
      setAgents(agents.filter((a) => a.address !== address));
    }
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
      sendMessage?.(
        messageContent,
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
      sendMessage(
        suggestion,
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
                exit={{ opacity: 0, y: 20 }}
                initial={{ opacity: 0, y: 20 }}
                key={suggestedAction}
                transition={{ delay: 0.05 * index }}
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
          className={`rounded-md border border-border bg-background transition-all duration-150 focus-within:border-border hover:border-muted-foreground/50 ${isMultiAgentMode ? "p-2" : "p-3"}`}
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
                className={`grow resize-none border-0! border-none! bg-transparent text-sm outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden ${isMultiAgentMode ? "px-1 py-1 min-h-[24px] max-h-[120px]" : "p-2"}`}
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
                            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground h-6"
                          >
                            {agent.image ? (
                              <img
                                alt={agent.name}
                                className="h-4 w-4 shrink-0 rounded-full object-cover"
                                src={agent.image}
                              />
                            ) : (
                              <div className="h-4 w-4 shrink-0 rounded-full bg-muted" />
                            )}
                            <span>{agent.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveAgent(agent.address);
                              }}
                              className="rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
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
                    className="h-8 w-[200px] justify-between gap-2 px-2"
                    variant="ghost"
                    onClick={() => {
                      setOpenDialog(true);
                    }}
                  >
                    {singleAgent?.image ? (
                      <img
                        alt={singleAgent.name}
                        className="h-5 w-5 shrink-0 rounded-full object-cover"
                        src={singleAgent.image}
                      />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full bg-muted" />
                    )}
                    <span className="flex-1 truncate text-left">
                      {singleAgent?.name || "Select agent"}
                    </span>
                  </Button>
                </>
              )}
            </PromptInputTools>

            <PromptInputSubmit
              className={`rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-[#3d8aff] disabled:bg-muted disabled:text-muted-foreground ${isMultiAgentMode ? "size-7" : "size-8"}`}
              disabled={
                !input.trim() ||
                (isMultiAgentMode && currentSelectedAgents.length === 0)
              }
            >
              <ArrowUpIcon size={isMultiAgentMode ? 12 : 14} />
            </PromptInputSubmit>
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
                            className="h-6 w-6 shrink-0 rounded-full object-cover"
                            src={agent.image}
                          />
                        ) : (
                          <div className="h-6 w-6 shrink-0 rounded-full bg-muted" />
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
    </div>
  );
}
