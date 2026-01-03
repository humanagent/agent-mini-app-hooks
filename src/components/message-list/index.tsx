import { ChatHeader, Greeting } from "@components/chat-area/index";
import { InputArea } from "@components/input-area";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useXMTPConversations } from "@hooks/use-xmtp-conversations";
import { useCallback, useEffect, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className="fade-in w-full animate-in duration-150">
          <div
            className={`flex w-full items-start gap-2 md:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col gap-2 md:gap-4 max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]">
              <div
                className={`flex flex-col gap-2 overflow-hidden text-sm w-fit break-words rounded-md px-3 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}>
                <div className="space-y-4 whitespace-normal size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto">
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ConversationView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { client } = useXMTPClient();
  const { selectedConversation } = useXMTPConversations(client);

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
          .filter((msg: any) => typeof msg.content === "string")
          .map((msg: any) => ({
            id: msg.id,
            role: msg.senderInboxId === client.inboxId ? "user" : "assistant",
            content: msg.content as string,
          }));

        if (mounted) {
          setMessages(chatMessages);
        }

        const stream = await selectedConversation.stream({
          onValue: (message: any) => {
            if (!mounted || typeof message.content !== "string") {
              return;
            }

            const newMessage: Message = {
              id: message.id,
              role:
                message.senderInboxId === client.inboxId ? "user" : "assistant",
              content: message.content as string,
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
          stream.end().catch(console.error);
        };
      } catch (error) {
        console.error("[ConversationView] Error setting up messages:", error);
      }
    };

    void setupMessages();

    return () => {
      mounted = false;
    };
  }, [client, selectedConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!client || !selectedConversation) {
        return;
      }

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        await selectedConversation.send(content);
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      } catch (error) {
        console.error("[ConversationView] Error sending message:", error);
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      }
    },
    [client, selectedConversation],
  );

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader />

      <div className="relative flex-1">
        <div className="absolute inset-0 touch-pan-y overflow-y-auto">
          <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
            {messages.length === 0 && <Greeting />}
            {messages.length > 0 && <MessageList messages={messages} />}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        <InputArea
          messages={messages}
          sendMessage={(content) => {
            void handleSendMessage(content);
          }}
        />
      </div>
    </div>
  );
}
