"use client";

import { useState, useEffect, useRef } from "react";
import { Greeting } from "./greeting";
import { ChatHeader } from "./chat-header";
import { InputArea } from "./input-area";
import { useXMTPClient } from "@/hooks/use-xmtp-client";
import { useXMTPConversations } from "@/hooks/use-xmtp-conversations";
import { findOrCreateDmWithAddress } from "@/lib/xmtp/conversations";

const FIXED_AGENT_ADDRESS = "0x194c31cae1418d5256e8c58e0d08aee1046c6ed0";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { client, isLoading, error } = useXMTPClient();
  const { selectedConversation } = useXMTPConversations(client);
  const conversationRef = useRef<any>(null);

  console.log("[ChatArea] Render - client state:", {
    hasClient: !!client,
    isLoading,
    hasError: !!error,
    clientInboxId: client?.inboxId,
  });

  useEffect(() => {
    console.log("[ChatArea] useEffect triggered - client state:", {
      hasClient: !!client,
      isLoading,
      hasError: !!error,
    });

    if (!client) {
      console.log("[ChatArea] XMTP client not ready yet", { isLoading, error: error?.message });
      return;
    }

    console.log("[ChatArea] Client is ready, inboxId:", client.inboxId);

    const setupConversation = async () => {
      try {
        console.log("[ChatArea] Finding or creating conversation with agent:", FIXED_AGENT_ADDRESS);
        const conversation = await findOrCreateDmWithAddress(client, FIXED_AGENT_ADDRESS);
        conversationRef.current = conversation;
        console.log("[ChatArea] Conversation ready:", conversation.id);

        if (!conversation) {
          console.error("[ChatArea] Failed to get conversation");
          return;
        }

        const loadMessages = async () => {
          try {
            console.log("[ChatArea] Loading existing messages...");
            await conversation.sync();
            const existingMessages = await conversation.messages();
            console.log("[ChatArea] Loaded", existingMessages.length, "existing messages");

            const chatMessages: Message[] = existingMessages.map((msg: any) => {
              const isFromMe = msg.senderInboxId === client?.inboxId;
              return {
                id: msg.id,
                role: isFromMe ? "user" : "assistant",
                content: msg.content as string,
              };
            });

            setMessages(chatMessages);
            console.log("[ChatArea] Messages set in state:", chatMessages.length);
          } catch (error) {
            console.error("[ChatArea] Error loading messages:", error);
          }
        };

        await loadMessages();

        const streamMessages = async () => {
          try {
            console.log("[ChatArea] Starting message stream...");
            const stream = await conversation.stream({
              onValue: (message: any) => {
                console.log("[ChatArea] New message received:", {
                  id: message.id,
                  content: message.content,
                  senderInboxId: message.senderInboxId,
                });

                const isFromMe = message.senderInboxId === client?.inboxId;
                const newMessage: Message = {
                  id: message.id,
                  role: isFromMe ? "user" : "assistant",
                  content: message.content as string,
                };

                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === message.id);
                  if (exists) {
                    console.log("[ChatArea] Message already exists, skipping:", message.id);
                    return prev;
                  }
                  console.log("[ChatArea] Adding new message to state");
                  return [...prev, newMessage];
                });
              },
            });

            return () => {
              stream.end().catch(console.error);
            };
          } catch (error) {
            console.error("[ChatArea] Error setting up message stream:", error);
          }
        };

        const cleanupPromise = streamMessages();

        return () => {
          cleanupPromise.then((cleanup) => cleanup?.()).catch(console.error);
        };
      } catch (error) {
        console.error("[ChatArea] Error setting up conversation:", error);
      }
    };

    setupConversation();
  }, [client]);

  const handleSendMessage = async (content: string) => {
    console.log("[ChatArea] handleSendMessage called with:", content);
    console.log("[ChatArea] Client state at send time:", {
      hasClient: !!client,
      isLoading,
      hasError: !!error,
      clientInboxId: client?.inboxId,
    });

    if (!client) {
      console.error("[ChatArea] Cannot send message: XMTP client not ready", {
        isLoading,
        error: error?.message,
      });
      return;
    }

    let conversation = conversationRef.current;

    if (!conversation) {
      console.log("[ChatArea] Conversation not in ref, finding/creating it...");
      try {
        conversation = await findOrCreateDmWithAddress(client, FIXED_AGENT_ADDRESS);
        conversationRef.current = conversation;
        console.log("[ChatArea] Got conversation:", conversation.id);
      } catch (error) {
        console.error("[ChatArea] Failed to get conversation:", error);
        return;
      }
    }

    console.log("[ChatArea] Using conversation:", conversation.id);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => {
      console.log("[ChatArea] Adding temporary message to UI");
      return [...prev, tempMessage];
    });

    try {
      console.log("[ChatArea] Sending message via XMTP to agent:", FIXED_AGENT_ADDRESS);
      await conversation.send(content);
      console.log("[ChatArea] Message sent successfully via XMTP");

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempMessage.id);
        console.log("[ChatArea] Removing temp message, keeping sent message");
        return withoutTemp;
      });
    } catch (error) {
      console.error("[ChatArea] Error sending message:", error);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempMessage.id);
        console.log("[ChatArea] Removing temp message due to error");
        return withoutTemp;
      });
    }
  };

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader chatId="wireframe" isReadonly={false} />

      <div className="relative flex-1">
        <div className="absolute inset-0 touch-pan-y overflow-y-auto">
          <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
            {messages.length === 0 && <Greeting />}
            {messages.map((message) => (
              <div
                key={message.id}
                className="group/message is-user fade-in w-full animate-in duration-150"
              >
                <div className="flex w-full items-start gap-2 md:gap-3 justify-end">
                    <div className="flex flex-col gap-2 md:gap-4 max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]">
                    <div className="flex flex-col gap-2 overflow-hidden text-sm group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground w-fit break-words rounded-md px-3 py-2">
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
        <InputArea messages={messages} sendMessage={handleSendMessage} />
      </div>
    </div>
  );
}