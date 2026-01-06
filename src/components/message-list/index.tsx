import { ChatHeader, Greeting } from "@components/chat-area/index";
import { InputArea, type Message } from "@components/input-area";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useCallback, useEffect, useState, useRef } from "react";
import type { DecodedMessage } from "@xmtp/browser-sdk";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { ThinkingIndicator } from "@ui/thinking-indicator";
import { createGroupWithAgentAddresses } from "@/lib/xmtp/conversations";
import type { AgentConfig } from "@/lib/agents";
import { motion } from "framer-motion";
import { CopyIcon } from "@ui/icons";

export function MessageList({ messages }: { messages: Message[] }) {
  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className="fade-in w-full animate-in duration-150"
        >
          <div
            className={`flex w-full items-start gap-2 md:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex flex-col gap-2 md:gap-4 max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]">
              <div
                className={`flex flex-col gap-2 overflow-hidden text-sm w-fit break-words rounded-md px-3 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <div className="space-y-4 whitespace-normal size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto">
                  <p>{message.content}</p>
                </div>
              </div>
              {message.role === "assistant" && (
                <button
                  type="button"
                  onClick={() => {
                    void handleCopy(message.content);
                  }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  <CopyIcon size={14} />
                  <span>Copy</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ConversationView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSyncingConversation, setIsSyncingConversation] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { client } = useXMTPClient();
  const {
    selectedConversation,
    setSelectedConversation,
    refreshConversations,
  } = useConversationsContext();

  useEffect(() => {
    if (!client || !selectedConversation) {
      return;
    }

    let mounted = true;

    const setupMessages = async () => {
      try {
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
            setSyncError(errorMessage);
            setIsSyncingConversation(false);
            return;
          }
        }
        setIsSyncingConversation(false);

        setIsLoadingMessages(true);
        try {
          const existingMessages = await selectedConversation.messages();

          const chatMessages: Message[] = existingMessages
            .filter(
              (msg: DecodedMessage<unknown>): msg is DecodedMessage<string> =>
                typeof msg.content === "string",
            )
            .map((msg) => {
              const content = typeof msg.content === "string" ? msg.content : "";
              return {
                id: msg.id,
                role: msg.senderInboxId === client.inboxId ? "user" : "assistant",
                content,
              };
            });

          if (mounted) {
            setMessages(chatMessages);
            setIsLoadingMessages(false);
          }

          const stream = await selectedConversation.stream({
            onValue: (message: DecodedMessage<unknown>) => {
              if (!mounted || typeof message.content !== "string") {
                return;
              }

              const newMessage: Message = {
                id: message.id,
                role:
                  message.senderInboxId === client.inboxId ? "user" : "assistant",
                content: message.content,
              };

              setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) {
                  return prev;
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

          return () => {
            void stream.end();
          };
        } catch (error) {
          if (mounted) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to load messages";
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
          setSyncError(errorMessage);
          setIsSyncingConversation(false);
          setIsLoadingMessages(false);
        }
      }
    };

    void setupMessages();

    return () => {
      mounted = false;
    };
  }, [client, selectedConversation]);

  useEffect(() => {
    return () => {
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
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

      try {
        await conversation.send(content);
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        
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
      <ChatHeader />

      <div className="relative flex-1">
        <div className="absolute inset-0 touch-pan-y overflow-y-auto">
          <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
            {createError && (
              <ThinkingIndicator
                error
                message={`Error creating conversation: ${createError}`}
              />
            )}
            {isCreatingConversation && !createError && (
              <ThinkingIndicator message="Creating conversation..." />
            )}
            {syncError && (
              <ThinkingIndicator
                error
                message={`Error syncing conversation: ${syncError}`}
              />
            )}
            {isSyncingConversation && !syncError && !isCreatingConversation && (
              <ThinkingIndicator message="Syncing conversation..." />
            )}
            {loadError && (
              <ThinkingIndicator
                error
                message={`Error loading messages: ${loadError}`}
              />
            )}
            {isLoadingMessages && !loadError && !isSyncingConversation && !isCreatingConversation && (
              <ThinkingIndicator message="Loading messages..." />
            )}
            {isWaitingForAgent && !isCreatingConversation && !isSyncingConversation && !isLoadingMessages && (
              <ThinkingIndicator message="Waiting for agent response..." />
            )}
            {!selectedConversation && !isCreatingConversation && !createError && selectedAgents.length === 0 && (
              <Greeting />
            )}
            {messages.length > 0 && <MessageList messages={messages} />}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        <InputArea
          selectedAgents={selectedAgents}
          setSelectedAgents={setSelectedAgents}
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
