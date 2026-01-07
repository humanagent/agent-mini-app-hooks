import { ChatHeader, Greeting } from "@components/chat-area/index";
import { InputArea, type Message } from "@components/input-area";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useCallback, useEffect, useState, useRef } from "react";
import type { DecodedMessage } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { useParams, useNavigate } from "react-router";
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
import { generateConversationMetadata } from "@/lib/generate-conversation-name";
import { AI_AGENTS } from "@/agent-registry/agents";

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
              className={`group flex w-full items-start ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}
            >
              <div
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[80%] md:max-w-[70%]`}
              >
                <div
                  className={`flex flex-col overflow-hidden text-sm w-fit break-words rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  <div className="space-y-2 whitespace-normal size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto">
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-0.5 mt-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            void handleCopy(message.content, message.id);
                          }}
                        >
                          {isCopied ? (
                            <CheckIcon size={14} />
                          ) : (
                            <CopyIcon size={14} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCopied ? "Copied" : "Copy"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </TooltipProvider>
  );
}

export function ConversationView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);
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
  const { client } = useXMTPClient();
  const {
    selectedConversation,
    setSelectedConversation,
    conversations,
    refreshConversations,
    pendingConversation,
    setPendingConversation,
  } = useConversationsContext();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // Handle pending conversation creation (optimistic loading)
  useEffect(() => {
    if (!pendingConversation || !client) {
      return;
    }

    console.log(
      "[ConversationView] Pending conversation detected, creating...",
      pendingConversation.agentAddresses,
    );

    let mounted = true;

    const createPendingConversation = async () => {
      try {
        setIsCreatingConversation(true);
        setCreateError(null);

        const conversation = await createGroupWithAgentAddresses(
          client,
          pendingConversation.agentAddresses,
        );

        if (!mounted) {
          return;
        }

        console.log(
          "[ConversationView] Pending conversation created:",
          conversation.id,
        );

        setPendingConversation(null);
        setSelectedConversation(conversation);
        setIsCreatingConversation(false);

        console.log(
          "[ConversationView] Conversation will appear via stream, skipping refresh",
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create conversation";
        console.error(
          "[ConversationView] Failed to create pending conversation:",
          errorMessage,
        );
        setCreateError(errorMessage);
        setIsCreatingConversation(false);
        setPendingConversation(null);
      }
    };

    void createPendingConversation();

    return () => {
      mounted = false;
    };
  }, [
    pendingConversation,
    client,
    setPendingConversation,
    setSelectedConversation,
    refreshConversations,
  ]);

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
        console.log("[ConversationView] Cleaning up previous stream");
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
  }, [
    selectedAgents,
    selectedConversation,
    setSelectedConversation,
    navigate,
  ]);

  // Sync selected conversation with URL params
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
    }
  }, [
    conversationId,
    conversations,
    selectedConversation,
    setSelectedConversation,
    navigate,
  ]);

  useEffect(() => {
    console.log(
      "[ConversationView] selectedConversation changed:",
      selectedConversation?.id,
    );

    // Clear messages immediately when conversation changes
    setMessages([]);
    setSyncError(null);
    setLoadError(null);
    setIsSyncingConversation(false);
    setIsLoadingMessages(false);
    setIsWaitingForAgent(false);

    // Cleanup previous stream
    if (streamCleanupRef.current) {
      console.log("[ConversationView] Cleaning up previous stream");
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
              };
            });

          if (mounted) {
            console.log(
              "[ConversationView] Setting messages:",
              chatMessages.length,
            );
            setMessages(chatMessages);
            setIsLoadingMessages(false);
          }

          if (
            mounted &&
            selectedConversation instanceof Group &&
            selectedConversation.name === "Agent Group" &&
            chatMessages.length > 0
          ) {
            console.log(
              "[ConversationView] Conversation needs naming, generating metadata...",
            );
            try {
              const firstUserMessage = chatMessages.find(
                (msg) => msg.role === "user",
              );
              if (firstUserMessage) {
                const members = await selectedConversation.members();
                const allAddresses = members.flatMap((member) =>
                  member.accountIdentifiers
                    .filter((id) => id.identifierKind === "Ethereum")
                    .map((id) => id.identifier.toLowerCase()),
                );

                const agentAddresses = allAddresses.filter((addr) => {
                  const normalizedAddr = addr.toLowerCase();
                  return AI_AGENTS.some(
                    (agent) => agent.address.toLowerCase() === normalizedAddr,
                  );
                });

                if (agentAddresses.length > 0) {
                  const metadata = await generateConversationMetadata(
                    firstUserMessage.content,
                    agentAddresses,
                  );
                  console.log(
                    "[ConversationView] Generated metadata:",
                    metadata,
                  );
                  await selectedConversation.updateName(metadata.name);
                  if (metadata.description) {
                    await selectedConversation.updateDescription(
                      metadata.description,
                    );
                  }
                  void refreshConversations();
                }
              }
            } catch (error) {
              console.error(
                "[ConversationView] Error generating conversation metadata on selection:",
                error,
              );
            }
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

              if (newMessage.role === "assistant" && mounted) {
                setIsWaitingForAgent(false);
                if (waitingTimeoutRef.current) {
                  clearTimeout(waitingTimeoutRef.current);
                  waitingTimeoutRef.current = null;
                }
              }
            },
          });

          streamCleanupRef.current = async () => {
            console.log("[ConversationView] Ending stream");
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
      console.log("[ConversationView] Cleanup effect");
      mounted = false;
      if (streamCleanupRef.current) {
        void streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
    };
  }, [client, selectedConversation]);

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
      };

      setMessages((prev) => [...prev, tempMessage]);

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

        if (
          conversation instanceof Group &&
          conversation.name === "Agent Group"
        ) {
          console.log("[ConversationView] Generating conversation metadata...");
          try {
            const members = await conversation.members();
            const allAddresses = members.flatMap((member) =>
              member.accountIdentifiers
                .filter((id) => id.identifierKind === "Ethereum")
                .map((id) => id.identifier.toLowerCase()),
            );

            const agentAddresses = allAddresses.filter((addr) => {
              const normalizedAddr = addr.toLowerCase();
              return AI_AGENTS.some(
                (agent) => agent.address.toLowerCase() === normalizedAddr,
              );
            });

            if (agentAddresses.length > 0) {
              const metadata = await generateConversationMetadata(
                content,
                agentAddresses,
              );
              console.log("[ConversationView] Generated metadata:", metadata);
              await conversation.updateName(metadata.name);
              if (metadata.description) {
                await conversation.updateDescription(metadata.description);
              }
              void refreshConversations();
            }
          } catch (error) {
            console.error(
              "[ConversationView] Error generating conversation metadata:",
              error,
            );
          }
        }
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
    ],
  );

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader conversation={selectedConversation} />

      <div className="relative flex-1">
        <div className="absolute inset-0 touch-pan-y overflow-y-auto">
          <div className="mx-auto flex min-w-0 max-w-4xl flex-col px-3 py-4 md:px-6 md:py-6">
            {createError && (
              <ThinkingIndicator
                error
                message={`Error creating conversation: ${createError}`}
              />
            )}
            {(isCreatingConversation || pendingConversation) &&
              !createError && (
                <ThinkingIndicator message="Creating conversation..." />
              )}
            {syncError && (
              <ThinkingIndicator
                error
                message={`Error syncing conversation: ${syncError}`}
              />
            )}
            {isSyncingConversation &&
              !syncError &&
              !isCreatingConversation &&
              !pendingConversation && (
                <ThinkingIndicator message="Syncing conversation..." />
              )}
            {loadError && (
              <ThinkingIndicator
                error
                message={`Error loading messages: ${loadError}`}
              />
            )}
            {isLoadingMessages &&
              !loadError &&
              !isSyncingConversation &&
              !isCreatingConversation &&
              !pendingConversation && (
                <ThinkingIndicator message="Loading messages..." />
              )}
            {!selectedConversation &&
              !isCreatingConversation &&
              !createError &&
              selectedAgents.length === 0 && (
                <Greeting
                  onOpenAgents={() => {
                    setOpenAgentsDialog(true);
                  }}
                />
              )}
            {messages.length > 0 && <MessageList messages={messages} />}
            {isWaitingForAgent &&
              !isCreatingConversation &&
              !isSyncingConversation &&
              !isLoadingMessages && (
                <ThinkingIndicator message="Waiting for agent response..." />
              )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
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
