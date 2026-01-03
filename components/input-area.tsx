"use client";

import { useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "./model-selector";
import { Button } from "./ui/button";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./prompt-input";
import { ArrowUpIcon, PaperclipIcon } from "./icons";
import { SuggestedActions } from "./suggested-actions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function InputArea({
  messages = [],
  sendMessage,
}: {
  messages?: Message[];
  sendMessage?: (content: string) => void;
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [attachments] = useState([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageContent = input.trim();
    
    if (!messageContent) {
      console.log("[InputArea] Submit attempted but message is empty");
      return;
    }

    console.log("[InputArea] Form submitted with message:", messageContent);
    console.log("[InputArea] Calling sendMessage callback");
    
    if (sendMessage) {
      sendMessage(messageContent);
      setInput("");
      console.log("[InputArea] Message sent, input cleared");
    } else {
      console.error("[InputArea] sendMessage callback is not provided!");
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 && (
          <SuggestedActions chatId="wireframe" sendMessage={sendMessage || (() => {})} />
        )}

      <PromptInput 
        className="rounded-md border border-border bg-background p-3 transition-all duration-150 focus-within:border-border hover:border-muted-foreground/50"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <PromptInputTextarea
            className="grow resize-none border-0! border-none! bg-transparent p-2 text-sm outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <PromptInputToolbar className="border-top-0! border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
          <PromptInputTools className="gap-0 sm:gap-0.5">
            <Button
              className="h-8 p-1 md:h-fit md:p-2"
              type="button"
              variant="ghost"
            >
              <PaperclipIcon size={16} />
            </Button>
            <ModelSelector onOpenChange={setOpen} open={open}>
              <ModelSelectorTrigger asChild>
                <Button className="h-8 w-[200px] justify-between px-2" variant="ghost">
                  <ModelSelectorLogo provider="anthropic" />
                  <ModelSelectorName>Claude Opus 4.5</ModelSelectorName>
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent>
                <ModelSelectorInput placeholder="Search models..." />
                <ModelSelectorList>
                  <ModelSelectorGroup heading="Anthropic">
                    <ModelSelectorItem value="anthropic/claude-opus-4.5">
                      <ModelSelectorLogo provider="anthropic" />
                      <ModelSelectorName>Claude Opus 4.5</ModelSelectorName>
                    </ModelSelectorItem>
                  </ModelSelectorGroup>
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputTools>

          <PromptInputSubmit
            className="size-8 rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-[#3d8aff] disabled:bg-muted disabled:text-muted-foreground"
            disabled={!input.trim()}
          >
            <ArrowUpIcon size={14} />
          </PromptInputSubmit>
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}