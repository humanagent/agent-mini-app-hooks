import { ChatHeader, Greeting } from "@components/chat-area/index";
import { InputArea, type Message } from "@components/input-area";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useCallback, useEffect, useState, useRef } from "react";
import type { DecodedMessage } from "@xmtp/browser-sdk";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { useParams, useNavigate, useLocation } from "react-router";
import { ThinkingIndicator } from "@ui/thinking-indicator";
import { createGroupWithAgentAddresses } from "@/lib/xmtp/conversations";
import type { AgentConfig } from "@/agent-registry/agents";
import { CopyIcon, CheckIcon } from "@ui/icons";
import { Button } from "@ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getMessageSentAt(msg: DecodedMessage<unknown>): Date | undefined {
  // Handle both sentAt (Date) and sentAtNs (bigint nanoseconds)
  const msgAny = msg as { sentAt?: Date; sentAtNs?: bigint };
  if (msgAny.sentAt) return msgAny.sentAt;
  if (msgAny.sentAtNs) return new Date(Number(msgAny.sentAtNs) / 1_000_000);
  return undefined;
}

export function MessageList({ messages }: { messages: Message[] }) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  return (
    <TooltipProvider>
      {messages.map((message) => {
        const isCopied = copiedMessageId === message.id;
        return (
          <div
            key={message.id}
            className="fade-in w-full animate-in duration-150"
          >
            <div
              className={`group flex w-full items-start ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[80%] md:max-w-[70%]`}
              >
                <div
                  className={`flex flex-col overflow-hidden text-xs w-fit break-words rounded px-4 py-3 ${
                    message.role === "user"
                      ? "bg-[var(--message-user)] text-[var(--message-user-foreground)]"
                      : "text-foreground"
                  }`}
                >
                  <div className="space-y-2 whitespace-normal size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto">
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 mt-1 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sentAt && (
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatTimeAgo(message.sentAt)}
                    </span>
                  )}
                  {message.role === "assistant" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            void handleCopy(message.content, message.id);
                          }}
                        >
                          {isCopied ? (
                            <CheckIcon size={12} />
                          ) : (
                            <CopyIcon size={12} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCopied ? "Copied" : "Copy"}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </TooltipProvider>
  );
}

export function ConversationView({
  initialAgents,
  customGreeting,
}: {
  initialAgents?: AgentConfig[];
  customGreeting?: React.ReactNode;
} = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>(
    initialAgents || [],
  );
  const [openAgentsDialog, setOpenAgentsDialog] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSyncingConversation, setIsSyncingConversation] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamCleanupRef = useRef<(() => Promise<void>) | null>(null);
  const tempMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { client } = useXMTPClient();
  const {
    selectedConversation,
    setSelectedConversation,
    conversations,
    refreshConversations,
    setPendingConversation,
    isLoading: isLoadingConversations,
  } = useConversationsContext();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, []);

  // Handle agent selection from navigation (e.g., from explore page)
  const locationStateRef = useRef<unknown>(null);
  useEffect(() => {
    // Only process if state changed and we haven't processed this state yet
    if (
      location.state &&
      location.state !== locationStateRef.current &&
      !conversationId
    ) {
      locationStateRef.current = location.state;
      const state = location.state as { selectedAgent?: AgentConfig } | null;
      if (state?.selectedAgent) {
        console.log(
          "[ConversationView] Agent selected via navigation:",
          state.selectedAgent.name,
        );
        // Clear any pending conversation to prevent auto-creation
        setPendingConversation(null);
        setSelectedAgents([state.selectedAgent]);
        // Clear location state to prevent re-applying on re-renders
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [
    location.state,
    conversationId,
    navigate,
    location.pathname,
    setPendingConversation,
  ]);

  // Conversations are ONLY created when user clicks send button in handleSendMessage
  // No automatic conversation creation is allowed

  // Reset view when agent is selected in input area
  const prevSelectedAgentsRef = useRef<AgentConfig[]>([]);
  useEffect(() => {
    const agentsChanged =
      selectedAgents.length !== prevSelectedAgentsRef.current.length ||
      selectedAgents.some(
        (agent, index) =>
          agent.address !== prevSelectedAgentsRef.current[index]?.address,
      );

    if (agentsChanged && selectedAgents.length > 0) {
      console.log(
        "[ConversationView] Agent selected in input, resetting view",
        selectedAgents.map((a) => a.name),
      );

      // Clear conversation to show fresh chat area
      if (selectedConversation) {
        setSelectedConversation(null);
        navigate("/", { replace: true });
      }

      // Clear all messages and state
      setMessages([]);
      setSyncError(null);
      setLoadError(null);
      setIsSyncingConversation(false);
      setIsLoadingMessages(false);
      setIsWaitingForAgent(false);

      // Cleanup previous stream
      if (streamCleanupRef.current) {
        void streamCleanupRef.current();
        streamCleanupRef.current = null;
      }

      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }
      if (tempMessageTimeoutRef.current) {
        clearTimeout(tempMessageTimeoutRef.current);
        tempMessageTimeoutRef.current = null;
      }
    }

    prevSelectedAgentsRef.current = selectedAgents;
  }, [selectedAgents, selectedConversation, setSelectedConversation, navigate]);

  // Sync selected conversation with URL params
  const prevConversationIdRef = useRef<string | undefined>(conversationId);
  const prevSelectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation && conversation.id !== selectedConversation?.id) {
        console.log(
          "[ConversationView] Setting conversation from URL:",
          conversationId,
        );
        setSelectedConversation(conversation);
      } else if (!conversation && conversations.length > 0) {
        console.log(
          "[ConversationView] Conversation not found in list, navigating to home",
        );
        navigate("/");
      }
    } else {
      // Clear selected conversation when navigating to home (no conversationId in URL)
      if (selectedConversation) {
        console.log(
          "[ConversationView] Clearing selected conversation - navigating to home",
        );
        setSelectedConversation(null);
      }
    }

    // Clear stacked agents when navigating to home (either from conversation OR when selectedConversation is cleared)
    const wasOnConversation = prevConversationIdRef.current !== undefined;
    const conversationCleared =
      prevSelectedConversationRef.current !== null &&
      selectedConversation === null;
    const isOnHome = !conversationId;

    if (
      isOnHome &&
      !location.state &&
      (wasOnConversation || conversationCleared) &&
      selectedAgents.length > 0
    ) {
      console.log(
        "[ConversationView] Clearing stacked agents - on home with no conversation",
      );
      setSelectedAgents([]);
    }

    prevConversationIdRef.current = conversationId;
    prevSelectedConversationRef.current = selectedConversation;
  }, [
    conversationId,
    conversations,
    selectedConversation,
    setSelectedConversation,
    navigate,
    selectedAgents,
    location.state,
  ]);

  useEffect(() => {
    // Clear messages immediately when conversation changes
    setMessages([]);
    setSyncError(null);
    setLoadError(null);
    setIsSyncingConversation(false);
    setIsLoadingMessages(false);
    setIsWaitingForAgent(false);

    // Cleanup previous stream
    if (streamCleanupRef.current) {
      void streamCleanupRef.current();
      streamCleanupRef.current = null;
    }

    if (waitingTimeoutRef.current) {
      clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = null;
    }
    if (tempMessageTimeoutRef.current) {
      clearTimeout(tempMessageTimeoutRef.current);
      tempMessageTimeoutRef.current = null;
    }

    if (!client || !selectedConversation) {
      return;
    }

    let mounted = true;

    const setupMessages = async () => {
      try {
        console.log(
          "[ConversationView] Setting up messages for conversation:",
          selectedConversation.id,
        );
        setSyncError(null);
        setLoadError(null);
        setIsSyncingConversation(true);
        try {
          await selectedConversation.sync();
        } catch (error) {
          if (mounted) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to sync conversation";
            console.error("[ConversationView] Sync error:", errorMessage);
            setSyncError(errorMessage);
            setIsSyncingConversation(false);
            return;
          }
        }
        setIsSyncingConversation(false);

        setIsLoadingMessages(true);
        try {
          const existingMessages = await selectedConversation.messages();
          console.log(
            "[ConversationView] Loaded messages:",
            existingMessages.length,
          );

          const chatMessages: Message[] = existingMessages
            .filter(
              (msg: DecodedMessage<unknown>): msg is DecodedMessage<string> =>
                typeof msg.content === "string",
            )
            .map((msg) => {
              const content =
                typeof msg.content === "string" ? msg.content : "";
              return {
                id: msg.id,
                role:
                  msg.senderInboxId === client.inboxId ? "user" : "assistant",
                content,
                sentAt: getMessageSentAt(msg),
              };
            });

          if (mounted) {
            console.log(
              "[ConversationView] Setting messages:",
              chatMessages.length,
            );
            setMessages(chatMessages);
            setIsLoadingMessages(false);
            // Clear waiting state if last message is from assistant
            if (
              chatMessages.length > 0 &&
              chatMessages[chatMessages.length - 1]?.role === "assistant"
            ) {
              console.log(
                "[ConversationView] Last message is from assistant, clearing waiting state",
              );
              setIsWaitingForAgent(false);
              if (waitingTimeoutRef.current) {
                clearTimeout(waitingTimeoutRef.current);
                waitingTimeoutRef.current = null;
              }
            }
            // Scroll to bottom when messages are loaded
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }

          const stream = await selectedConversation.stream({
            onValue: (message: DecodedMessage<unknown>) => {
              if (!mounted || typeof message.content !== "string") {
                return;
              }

              const newMessage: Message = {
                id: message.id,
                role:
                  message.senderInboxId === client.inboxId
                    ? "user"
                    : "assistant",
                content: message.content,
                sentAt: getMessageSentAt(message),
              };

              setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) {
                  return prev;
                }
                if (newMessage.role === "user") {
                  const tempIndex = prev.findIndex(
                    (m) =>
                      m.id.startsWith("temp-") && m.content === message.content,
                  );
                  if (tempIndex !== -1) {
                    if (tempMessageTimeoutRef.current) {
                      clearTimeout(tempMessageTimeoutRef.current);
                      tempMessageTimeoutRef.current = null;
                    }
                    const updated = [...prev];
                    updated[tempIndex] = newMessage;
                    return updated;
                  }
                }
                return [...prev, newMessage];
              });

              // Scroll to bottom when new message arrives
              setTimeout(() => {
                scrollToBottom();
              }, 100);

              if (newMessage.role === "assistant" && mounted) {
                console.log(
                  "[ConversationView] Assistant message received, clearing waiting state",
                  newMessage.id,
                );
                setIsWaitingForAgent(false);
                if (waitingTimeoutRef.current) {
                  clearTimeout(waitingTimeoutRef.current);
                  waitingTimeoutRef.current = null;
                }
              }
            },
          });

          streamCleanupRef.current = async () => {
            await stream.end();
          };
        } catch (error) {
          if (mounted) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to load messages";
            console.error("[ConversationView] Load error:", errorMessage);
            setLoadError(errorMessage);
            setIsLoadingMessages(false);
          }
        }
      } catch (error) {
        if (mounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to load conversation";
          console.error("[ConversationView] Setup error:", errorMessage);
          setSyncError(errorMessage);
          setIsSyncingConversation(false);
          setIsLoadingMessages(false);
        }
      }
    };

    void setupMessages();

    return () => {
      mounted = false;
      if (streamCleanupRef.current) {
        void streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
    };
  }, [client, selectedConversation, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
      }
      if (tempMessageTimeoutRef.current) {
        clearTimeout(tempMessageTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = useCallback(
    async (content: string, agents?: AgentConfig[]) => {
      if (!client) {
        return;
      }

      let conversation = selectedConversation;

      if (!conversation) {
        const agentsToUse = agents || selectedAgents;
        if (agentsToUse.length === 0) {
          return;
        }

        try {
          console.log(
            "[ConversationView] Creating conversation via send button:",
            agentsToUse.map((a) => a.name),
          );
          setCreateError(null);
          setIsCreatingConversation(true);
          const agentAddresses = agentsToUse.map((agent) => agent.address);
          conversation = await createGroupWithAgentAddresses(
            client,
            agentAddresses,
          );
          setSelectedConversation(conversation);
          navigate(`/conversation/${conversation.id}`);
          void refreshConversations();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create conversation";
          setCreateError(errorMessage);
          setIsCreatingConversation(false);
          return;
        } finally {
          setIsCreatingConversation(false);
        }
      }

      if (!conversation) {
        return;
      }

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        sentAt: new Date(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Scroll to bottom when message is sent
      setTimeout(() => {
        scrollToBottom();
      }, 100);

      if (tempMessageTimeoutRef.current) {
        clearTimeout(tempMessageTimeoutRef.current);
      }
      tempMessageTimeoutRef.current = setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        tempMessageTimeoutRef.current = null;
      }, 5000);

      try {
        await conversation.send(content);

        setIsWaitingForAgent(true);
        if (waitingTimeoutRef.current) {
          clearTimeout(waitingTimeoutRef.current);
        }
        waitingTimeoutRef.current = setTimeout(() => {
          setIsWaitingForAgent(false);
          waitingTimeoutRef.current = null;
        }, 10000);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        setIsWaitingForAgent(false);
        if (waitingTimeoutRef.current) {
          clearTimeout(waitingTimeoutRef.current);
          waitingTimeoutRef.current = null;
        }
        if (tempMessageTimeoutRef.current) {
          clearTimeout(tempMessageTimeoutRef.current);
          tempMessageTimeoutRef.current = null;
        }
      }
    },
    [
      client,
      selectedConversation,
      selectedAgents,
      setSelectedConversation,
      refreshConversations,
      scrollToBottom,
    ],
  );

  return (
    <div className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden bg-black">
      <ChatHeader conversation={selectedConversation} />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 left-[1px] -webkit-overflow-scrolling-touch overscroll-behavior-contain overflow-y-auto touch-pan-y"
        >
          <div className="mx-auto flex min-w-0 max-w-4xl flex-col px-4 py-4 md:pl-[60px] md:pr-6 md:py-6">
            {createError && !selectedConversation && (
              <ThinkingIndicator
                error
                message={`Error creating conversation: ${createError}`}
              />
            )}
            {isCreatingConversation &&
              !createError &&
              !selectedConversation && (
                <ThinkingIndicator message="Creating conversation..." />
              )}
            {syncError && selectedConversation && (
              <ThinkingIndicator
                error
                message={`Error syncing conversation: ${syncError}`}
              />
            )}
            {isSyncingConversation &&
              !syncError &&
              !isCreatingConversation &&
              selectedConversation && (
                <ThinkingIndicator message="Syncing conversation..." />
              )}
            {loadError && selectedConversation && (
              <ThinkingIndicator
                error
                message={`Error loading messages: ${loadError}`}
              />
            )}
            {isLoadingMessages &&
              !loadError &&
              !isSyncingConversation &&
              !isCreatingConversation &&
              selectedConversation && (
                <ThinkingIndicator message="Loading messages..." />
              )}
            {conversationId &&
              !selectedConversation &&
              !isCreatingConversation &&
              !createError &&
              (isLoadingConversations || conversations.length === 0) && (
                <ThinkingIndicator message="Loading conversation..." />
              )}
            {!selectedConversation &&
              !isCreatingConversation &&
              !createError &&
              !conversationId &&
              messages.length === 0 &&
              (customGreeting
                ? customGreeting
                : selectedAgents.length === 0 && (
                    <Greeting
                      onOpenAgents={() => {
                        setOpenAgentsDialog(true);
                      }}
                    />
                  ))}
            {messages.length > 0 && <MessageList messages={messages} />}
            {isWaitingForAgent &&
              !isCreatingConversation &&
              !isSyncingConversation &&
              !isLoadingMessages &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role !== "assistant") && (
                <ThinkingIndicator message="Waiting for agent response..." />
              )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-black px-4 pb-4 pt-3 md:px-4 md:pb-4 md:pt-0">
        <InputArea
          {...(selectedConversation
            ? {}
            : {
                selectedAgents,
                setSelectedAgents,
                openAgentsDialog,
                onOpenAgentsDialogChange: setOpenAgentsDialog,
              })}
          messages={messages}
          sendMessage={(content, agents) => {
            void handleSendMessage(content, agents);
          }}
          conversation={selectedConversation ?? undefined}
        />
      </div>
    </div>
  );
}
