"use client";

import { useState } from "react";
import { Greeting } from "./greeting";
import { ChatHeader } from "./chat-header";
import { InputArea } from "./input-area";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: "user" as const,
        content,
      },
    ]);
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