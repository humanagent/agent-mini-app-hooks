import type { Conversation } from "@xmtp/browser-sdk";

export type ConversationWithMeta = {
  conversation: Conversation;
  lastMessagePreview?: string;
};

export async function sortConversationsByLastMessage(
  conversations: Conversation[],
): Promise<ConversationWithMeta[]> {
  const conversationsWithDates = await Promise.all(
    conversations.map(async (conversation) => {
      try {
        const lastMessage = await conversation.lastMessage();
        const createdAt = conversation.createdAt;

        let sortTime = Date.now();
        let lastMessagePreview: string | undefined;

        if (lastMessage) {
          const message = lastMessage as {
            sentAt?: Date;
            sentAtNs?: bigint;
            content?: unknown;
          };
          if (message.sentAt) {
            sortTime = message.sentAt.getTime();
          } else if (message.sentAtNs) {
            sortTime = Number(message.sentAtNs) / 1_000_000;
          }
          if (
            typeof message.content === "string" &&
            message.content.length > 0
          ) {
            lastMessagePreview =
              message.content.length > 40
                ? `${message.content.slice(0, 40)}...`
                : message.content;
          }
        } else if (createdAt) {
          sortTime = createdAt.getTime();
        }

        return {
          conversation,
          sortTime,
          lastMessagePreview,
        };
      } catch {
        const createdAt = conversation.createdAt;
        return {
          conversation,
          sortTime: createdAt ? createdAt.getTime() : Date.now(),
          lastMessagePreview: undefined,
        };
      }
    }),
  );

  return conversationsWithDates
    .sort((a, b) => b.sortTime - a.sortTime)
    .map((item) => ({
      conversation: item.conversation,
      lastMessagePreview: item.lastMessagePreview,
    }));
}
