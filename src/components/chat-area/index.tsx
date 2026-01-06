import { InputArea, type Message } from "@components/input-area";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { Loader2Icon } from "@ui/icons";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { DecodedMessage } from "@xmtp/browser-sdk";
import { type AgentConfig } from "@/lib/agents";
import { createGroupWithAgentAddresses } from "@/lib/xmtp/conversations";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { ShareButton } from "@/src/components/sidebar/share-button";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";

export const ChatHeader = () => {
  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />
      <ShareButton />
    </header>
  );
};

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.15 }}
      >
        Hello there
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-xl text-muted-foreground md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6, duration: 0.15 }}
      >
        This chat is secured by XMTP. Each conversation its a new identity,
        untraceable to the previous one
      </motion.div>
    </div>
  );
};

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
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
        await selectedConversation.sync();
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
          },
        });

        return () => {
          void stream.end();
        };
      } catch {
        // Error handling - messages will remain empty if setup fails
      }
    };

    setupMessages();

    return () => {
      mounted = false;
    };
  }, [client, selectedConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!client) {
        return;
      }

      if (selectedAgents.length === 0) {
        return;
      }

      let conversation = selectedConversation;

      if (!conversation) {
        try {
          setIsCreatingConversation(true);
          const agentAddresses = selectedAgents.map((agent) => agent.address);
          conversation = await createGroupWithAgentAddresses(
            client,
            agentAddresses,
          );
          setSelectedConversation(conversation);
          void refreshConversations();
        } catch {
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
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
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
            {messages.length === 0 && <Greeting />}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        <InputArea
          selectedAgents={selectedAgents}
          setSelectedAgents={setSelectedAgents}
          sendMessage={handleSendMessage}
          conversation={selectedConversation ?? null}
        />
      </div>
      {isCreatingConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-card p-6 shadow-lg">
            <Loader2Icon size={24} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Creating conversation...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
