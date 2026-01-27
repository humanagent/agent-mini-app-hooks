import type {
  Client,
  Conversation,
  DecodedMessage,
  GroupMember,
} from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState, useRef } from "react";
import type { ContentTypes } from "./utils";
import { toError, assignMessageRole } from "./utils";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentAt?: Date;
};

function getMessageSentAt(msg: DecodedMessage<unknown>): Date | undefined {
  const msgAny = msg as { sentAt?: Date; sentAtNs?: bigint };
  if (msgAny.sentAt) return msgAny.sentAt;
  if (msgAny.sentAtNs) return new Date(Number(msgAny.sentAtNs) / 1_000_000);
  return undefined;
}

export function useConversation(
  conversationId: string | null | undefined,
  client: Client<ContentTypes> | null,
) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const streamCleanupRef = useRef<(() => Promise<void>) | null>(null);

  // Get conversation from client
  useEffect(() => {
    if (!client || !conversationId) {
      setConversation(null);
      return;
    }

    let mounted = true;

    const loadConversation = async () => {
      try {
        const conv =
          await client.conversations.getConversationById(conversationId);
        if (mounted) {
          setConversation(conv || null);
        }
      } catch (err) {
        if (mounted) {
          setError(toError(err));
        }
      }
    };

    void loadConversation();

    return () => {
      mounted = false;
    };
  }, [client, conversationId]);

  // Load messages and stream
  useEffect(() => {
    if (!client || !conversation) {
      setMessages([]);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const setupMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Sync conversation
        await conversation.sync();

        // Load existing messages
        const existingMessages = await conversation.messages();
        const chatMessages: Message[] = existingMessages
          .filter(
            (msg: DecodedMessage<unknown>): msg is DecodedMessage<string> =>
              typeof msg.content === "string",
          )
          .map((msg) => ({
            id: msg.id,
            role: assignMessageRole(msg, client.inboxId),
            content: msg.content as string,
            sentAt: getMessageSentAt(msg),
          }));

        if (mounted) {
          setMessages(chatMessages);
        }

        // Load members if group
        if (conversation instanceof Group) {
          const conversationMembers = await conversation.members();
          if (mounted) {
            setMembers(conversationMembers);
          }
        } else {
          if (mounted) {
            setMembers([]);
          }
        }

        // Stream new messages
        const stream = await conversation.stream({
          onValue: (message: DecodedMessage<unknown>) => {
            if (!mounted || typeof message.content !== "string") {
              return;
            }

            const newMessage: Message = {
              id: message.id,
              role: assignMessageRole(message, client.inboxId),
              content: message.content,
              sentAt: getMessageSentAt(message),
            };

            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          },
        });

        streamCleanupRef.current = async () => {
          await stream.end();
        };

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(toError(err));
          setIsLoading(false);
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
  }, [client, conversation]);

  const send = useCallback(
    async (content: string) => {
      if (!conversation) {
        throw new Error("No conversation selected");
      }

      try {
        await conversation.send(content);
      } catch (err) {
        const error = toError(err);
        setError(error);
        throw error;
      }
    },
    [conversation],
  );

  const addMember = useCallback(
    async (address: string) => {
      if (!conversation || !(conversation instanceof Group)) {
        throw new Error("Can only add members to group conversations");
      }

      try {
        await conversation.addMembersByIdentifiers([
          {
            identifier: address.toLowerCase(),
            identifierKind: "Ethereum" as const,
          },
        ]);

        // Refresh members
        const updatedMembers = await conversation.members();
        setMembers(updatedMembers);
      } catch (err) {
        const error = toError(err);
        setError(error);
        throw error;
      }
    },
    [conversation],
  );

  const removeMember = useCallback(
    async (inboxId: string) => {
      if (!conversation || !(conversation instanceof Group)) {
        throw new Error("Can only remove members from group conversations");
      }

      try {
        await conversation.removeMembers([inboxId]);

        // Refresh members
        const updatedMembers = await conversation.members();
        setMembers(updatedMembers);
      } catch (err) {
        const error = toError(err);
        setError(error);
        throw error;
      }
    },
    [conversation],
  );

  const isGroup = conversation instanceof Group;

  return {
    conversation,
    messages,
    send,
    isLoading,
    error,
    isGroup,
    members,
    addMember,
    removeMember,
  };
}
