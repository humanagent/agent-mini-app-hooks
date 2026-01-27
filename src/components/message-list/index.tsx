import { Greeting } from "@components/chat-area/index";
import { InputArea, type Message } from "@components/input-area";
import { useClient } from "@xmtp/use-client";
import { useCallback, useEffect, useState, useRef } from "react";
import type { DecodedMessage, Conversation } from "@xmtp/browser-sdk";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { useParams, useNavigate, useLocation } from "react-router";
import { ThinkingIndicator } from "@ui/thinking-indicator";
import { createGroupWithAgentAddresses } from "@lib/agent-utils";
import type { AgentConfig } from "@xmtp/agents";
import { CopyIcon, CheckIcon } from "@ui/icons";
import { Button } from "@ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { MessageContent } from "./message-content";
import { Group } from "@xmtp/browser-sdk";
import { formatTimeAgo } from "@/src/utils";
import { useConversationMembers } from "@xmtp/use-conversation-members";
import { matchAgentsFromMembers } from "@lib/agent-utils";
import { AI_AGENTS } from "@xmtp/agents";

function getMessageSentAt(msg: DecodedMessage<unknown>): Date | undefined {
  // Handle both sentAt (Date) and sentAtNs (bigint nanoseconds)
  const msgAny = msg as { sentAt?: Date; sentAtNs?: bigint };
  if (msgAny.sentAt) return msgAny.sentAt;
  if (msgAny.sentAtNs) return new Date(Number(msgAny.sentAtNs) / 1_000_000);
  return undefined;
}

export function MessageList({
  messages,
  onMentionClick,
  isGroup = false,
  clientInboxId: _clientInboxId,
  conversationId,
}: {
  messages: Message[];
  onMentionClick?: (agent: AgentConfig) => void;
  isGroup?: boolean;
  clientInboxId?: string;
  conversationId?: string;
}) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { client } = useClient();
  const { members } = useConversationMembers(conversationId, client);
  const conversationAgents = matchAgentsFromMembers(members, AI_AGENTS);

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
      {messages.map((message, index) => {
        const isCopied = copiedMessageId === message.id;
        const role = message.role;
        const showAgentLogos = role === "assistant" && conversationAgents.length > 0;
        return (
          <div
            key={message.id}
            className="fade-in w-full animate-in duration-150"
          >
            <div
              className={`group flex w-full items-start ${role === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`flex flex-col ${role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[80%] md:max-w-[70%]`}
              >
                <div
                  className={`flex flex-col overflow-hidden text-xs w-fit break-words rounded px-4 py-3 ${
                    role === "user"
                      ? "bg-[var(--message-user)] text-[var(--message-user-foreground)]"
                      : "text-foreground"
                  }`}
                >
                  {showAgentLogos && (
                    <div className="flex items-center gap-1 mb-2">
                      {conversationAgents.map((agent) =>
                        agent.image ? (
                          <img
                            key={agent.address}
                            alt={agent.name}
                            className="h-3 w-3 shrink-0 rounded object-cover border border-zinc-800"
                            src={agent.image}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            key={agent.address}
                            className="h-3 w-3 shrink-0 rounded bg-zinc-800 border border-zinc-800 flex items-center justify-center"
                            title={agent.name}
                          >
                            <span className="text-[6px] text-muted-foreground leading-none">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  <div className="space-y-2 whitespace-normal size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto">
                    <MessageContent
                      content={message.content}
                      onMentionClick={onMentionClick}
                      isGroup={isGroup}
                    />
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 mt-1 ${role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sending && (
                    <span className="text-[10px] text-muted-foreground/60">
                      Sending...
                    </span>
                  )}
                  {!message.sending && message.sentAt && (
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatTimeAgo(message.sentAt)}
                    </span>
                  )}
                  {role === "assistant" && (
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
  const [createError, setCreateError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const streamCleanupRef = useRef<(() => Promise<void>) | null>(null);
  const tempMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isSendingRef = useRef(false);
  const shouldNavigateAfterCreateRef = useRef(true);
  const { client } = useClient();
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

  // Extract stream setup logic into reusable function
  const setupMessageStream = useCallback(
    async (conversation: Conversation, mountedRef: { current: boolean }) => {
      const stream = await conversation.stream({
        onValue: (message: DecodedMessage<unknown>) => {
          if (!mountedRef.current || typeof message.content !== "string") {
            return;
          }

          const newMessage: Message = {
            id: message.id,
            role:
              message.senderInboxId === client?.inboxId ? "user" : "assistant",
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

          setTimeout(() => {
            scrollToBottom();
          }, 100);
        },
      });

      return stream;
    },
    [client, scrollToBottom],
  );

  // Handle agent selection from navigation
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
        navigate("/chat", { replace: true });
      }

      // Clear all messages and state
      setMessages([]);
      setSyncError(null);
      setLoadError(null);

      // Cleanup previous stream
      if (streamCleanupRef.current) {
        void streamCleanupRef.current();
        streamCleanupRef.current = null;
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

  // Clear state when conversation changes
  useEffect(() => {
    prevSelectedConversationRef.current = selectedConversation;
    // If selectedConversation is cleared while on /chat, user clicked "New Chat"
    // Cancel any pending navigation from conversation creation
    if (
      selectedConversation === null &&
      (location.pathname === "/" || location.pathname === "/chat")
    ) {
      shouldNavigateAfterCreateRef.current = false;
    }
  }, [selectedConversation, location.pathname]);

  // Clear messages when navigating to /chat or / without a conversationId
  // This ensures messages are cleared even if selectedConversation was already null
  useEffect(() => {
    const isOnHome =
      !conversationId &&
      (location.pathname === "/" || location.pathname === "/chat");
    const wasOnConversation = prevConversationIdRef.current !== undefined;

    if (isOnHome && wasOnConversation && selectedConversation === null) {
      console.log("[ConversationView] Navigating to home, clearing messages");
      setMessages([]);
      setSyncError(null);
      setLoadError(null);
      setCreateError(null);

      // Cleanup stream if it exists
      if (streamCleanupRef.current) {
        void streamCleanupRef.current();
        streamCleanupRef.current = null;
      }

      if (tempMessageTimeoutRef.current) {
        clearTimeout(tempMessageTimeoutRef.current);
        tempMessageTimeoutRef.current = null;
      }
    }
  }, [conversationId, location.pathname, selectedConversation]);

  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation && conversation.id !== selectedConversation?.id) {
        console.log(
          "[ConversationView] Setting conversation from URL:",
          conversationId,
        );
        setSelectedConversation(conversation);
      } else if (!conversation) {
        // If conversation not found and we're still loading, wait
        if (isLoadingConversations) {
          console.log(
            "[ConversationView] Conversation not found yet, still loading conversations",
          );
          return;
        }
        // If conversations list is populated but conversation not found, try to load it directly
        if (conversations.length > 0 && client) {
          console.log(
            "[ConversationView] Conversation not in list, attempting to load directly:",
            conversationId,
          );
          // Try to get conversation directly from client
          client.conversations
            .getConversationById(conversationId)
            .then((conv) => {
              if (conv) {
                console.log(
                  "[ConversationView] Found conversation via direct lookup:",
                  conversationId,
                );
                setSelectedConversation(conv);
                void refreshConversations();
              } else {
                console.log(
                  "[ConversationView] Conversation not found, navigating to chat",
                );
                navigate("/chat");
              }
            })
            .catch((error) => {
              console.error(
                "[ConversationView] Error loading conversation:",
                error,
              );
              navigate("/chat");
            });
        } else if (conversations.length === 0 && !isLoadingConversations) {
          // No conversations and not loading - conversation doesn't exist
          console.log(
            "[ConversationView] No conversations available, navigating to chat",
          );
          navigate("/chat");
        }
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
    // Always clear messages when conversation changes or is cleared
    setMessages([]);
    setSyncError(null);
    setLoadError(null);

    if (tempMessageTimeoutRef.current) {
      clearTimeout(tempMessageTimeoutRef.current);
      tempMessageTimeoutRef.current = null;
    }

    // Cleanup stream when conversation is cleared
    if (!selectedConversation && streamCleanupRef.current) {
      void streamCleanupRef.current();
      streamCleanupRef.current = null;
    }

    // Skip if stream already exists (handled by first message flow) OR no conversation
    if (streamCleanupRef.current || !client || !selectedConversation) {
      if (streamCleanupRef.current && selectedConversation) {
        console.log("[ConversationView] Stream already exists, skipping setup");
      }
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
            return;
          }
        }

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
            // Scroll to bottom when messages are loaded
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }

          const mountedRef = { current: mounted };
          const stream = await setupMessageStream(
            selectedConversation,
            mountedRef,
          );

          streamCleanupRef.current = async () => {
            mountedRef.current = false;
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
  }, [client, selectedConversation, scrollToBottom, setupMessageStream]);

  useEffect(() => {
    return () => {
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

      // Prevent duplicate sends
      if (isSendingRef.current) {
        console.log(
          "[ConversationView] Send already in progress, ignoring duplicate",
        );
        return;
      }

      isSendingRef.current = true;

      try {
        let conversation = selectedConversation;

        if (!conversation) {
          const agentsToUse =
            agents && agents.length > 0 ? agents : selectedAgents;
          console.log(
            "[ConversationView] No conversation, agents passed:",
            agents?.map((a) => a.name),
            "selectedAgents:",
            selectedAgents.map((a) => a.name),
            "agentsToUse:",
            agentsToUse.map((a) => a.name),
          );
          if (agentsToUse.length === 0) {
            console.error(
              "[ConversationView] No agents available to create conversation",
            );
            setCreateError("Please select an agent before sending a message");
            isSendingRef.current = false;
            return;
          }

          try {
            console.log(
              "[ConversationView] Creating conversation and sending first message:",
              agentsToUse.map((a) => a.name),
            );
            setCreateError(null);

            // Capture starting path to detect if user navigated away during async operation
            const startingPath = location.pathname;
            // Reset navigation flag - will be cleared if "New Chat" is clicked
            shouldNavigateAfterCreateRef.current = true;

            // 0. Show optimistic message immediately with sending indicator
            const tempMessage: Message = {
              id: `temp-${Date.now()}`,
              role: "user",
              content,
              sentAt: new Date(),
              sending: true,
            };
            setMessages([tempMessage]);
            scrollToBottom();

            // 1. Create conversation
            const agentAddresses = agentsToUse.map((agent) => agent.address);
            conversation = await createGroupWithAgentAddresses(
              client,
              agentAddresses,
            );

            // 2. Sync conversation
            console.log("[ConversationView] Syncing new conversation");
            await conversation.sync();
            console.log("[ConversationView] Sync complete");

            // 3. Set up stream BEFORE sending
            const mountedRef = { current: true };
            const stream = await setupMessageStream(conversation, mountedRef);
            streamCleanupRef.current = async () => {
              mountedRef.current = false;
              await stream.end();
            };
            console.log("[ConversationView] Stream setup complete");

            // 4. Send message (stream will capture it)
            console.log(
              "[ConversationView] Sending first message to conversation:",
              conversation.id,
            );
            await conversation.send(content);
            console.log("[ConversationView] Message sent successfully");

            // 5. Load initial messages after send (in case stream missed it)
            const existingMessages = await conversation.messages();
            const chatMessages: Message[] = existingMessages
              .filter(
                (msg: DecodedMessage<unknown>): msg is DecodedMessage<string> =>
                  typeof msg.content === "string",
              )
              .map((msg) => ({
                id: msg.id,
                role:
                  msg.senderInboxId === client.inboxId ? "user" : "assistant",
                content: msg.content as string,
                sentAt: getMessageSentAt(msg),
                sending: false,
              }));
            setMessages(chatMessages);
            console.log(
              "[ConversationView] Loaded messages after send:",
              chatMessages.length,
            );

            // 6. Update state and navigate (only if user hasn't navigated away)
            setSelectedConversation(conversation);
            // Only navigate if we're still on the same path we started from
            // and navigation wasn't cancelled by "New Chat" click
            const currentPath = location.pathname;
            if (
              shouldNavigateAfterCreateRef.current &&
              (startingPath === "/" || startingPath === "/chat") &&
              (currentPath === "/" || currentPath === "/chat")
            ) {
              navigate(`/conversation/${conversation.id}`, { replace: true });
            }

            // 7. Refresh conversations list in background
            void refreshConversations();

            scrollToBottom();
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to create conversation";
            console.error(
              "[ConversationView] Failed to create conversation:",
              error,
            );
            // Remove temp message on error
            setMessages([]);
            setCreateError(errorMessage);
            isSendingRef.current = false;
            return;
          }
        } else {
          // Existing conversation - normal send flow
          // Add message optimistically with sending indicator
          const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content,
            sentAt: new Date(),
            sending: true,
          };

          setMessages((prev) => [...prev, tempMessage]);

          // Scroll to bottom when message is sent
          setTimeout(() => {
            scrollToBottom();
          }, 100);

          // Cleanup temp message after 5 seconds if not replaced
          if (tempMessageTimeoutRef.current) {
            clearTimeout(tempMessageTimeoutRef.current);
          }
          tempMessageTimeoutRef.current = setTimeout(() => {
            setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
            tempMessageTimeoutRef.current = null;
          }, 5000);

          try {
            console.log(
              "[ConversationView] Sending message to conversation:",
              conversation.id,
              "content:",
              content,
            );
            await conversation.send(content);
            console.log("[ConversationView] Message sent successfully");
          } catch (error) {
            console.error("[ConversationView] Failed to send message:", error);
            setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
            if (tempMessageTimeoutRef.current) {
              clearTimeout(tempMessageTimeoutRef.current);
              tempMessageTimeoutRef.current = null;
            }
            // Show error to user
            const errorMessage =
              error instanceof Error
                ? `Failed to send message: ${error.message}`
                : "Failed to send message";
            console.error("[ConversationView] Error message:", errorMessage);
            setCreateError(errorMessage);
          }
        }
      } finally {
        isSendingRef.current = false;
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

  const showCenteredInput = messages.length === 0;

  return (
    <div className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden bg-black">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 left-[1px] -webkit-overflow-scrolling-touch overscroll-behavior-contain overflow-y-auto touch-pan-y"
        >
          <div className="mx-auto flex min-h-full min-w-0 max-w-4xl flex-col px-4 py-4 md:px-6 md:py-6">
            {createError && (
              <ThinkingIndicator error message={`Error: ${createError}`} />
            )}
            {syncError && selectedConversation && (
              <ThinkingIndicator
                error
                message={`Error syncing conversation: ${syncError}`}
              />
            )}
            {loadError && selectedConversation && (
              <ThinkingIndicator
                error
                message={`Error loading messages: ${loadError}`}
              />
            )}
            {conversationId &&
              !selectedConversation &&
              !createError &&
              (isLoadingConversations || conversations.length === 0) && (
                <ThinkingIndicator message="Loading conversation..." />
              )}
            {messages.length > 0 && (
              <MessageList
                messages={messages}
                isGroup={selectedConversation instanceof Group}
                clientInboxId={client?.inboxId}
                conversationId={selectedConversation?.id}
              />
            )}
            {showCenteredInput && (
              <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 md:px-8">
                <div className="-translate-y-[20%] flex flex-col">
                  {!selectedConversation &&
                    !createError &&
                    !conversationId &&
                    messages.length === 0 &&
                    (customGreeting ? (
                      customGreeting
                    ) : (
                      <Greeting
                        onOpenAgents={() => {
                          setOpenAgentsDialog(true);
                        }}
                      />
                    ))}
                  <div className="mt-8">
                    <InputArea
                      selectedAgents={selectedAgents}
                      setSelectedAgents={setSelectedAgents}
                      openAgentsDialog={openAgentsDialog}
                      onOpenAgentsDialogChange={setOpenAgentsDialog}
                      sendMessage={(content, agents) => {
                        void handleSendMessage(content, agents);
                      }}
                      conversation={selectedConversation ?? undefined}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!showCenteredInput && (
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
            sendMessage={(content, agents) => {
              void handleSendMessage(content, agents);
            }}
            conversation={selectedConversation ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
