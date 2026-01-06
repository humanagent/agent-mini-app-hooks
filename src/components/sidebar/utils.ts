import type { Conversation } from "@xmtp/browser-sdk";

export async function sortConversationsByLastMessage(
  conversations: Conversation[],
): Promise<Conversation[]> {
  const conversationsWithDates = await Promise.all(
    conversations.map(async (conversation) => {
      try {
        const lastMessage = await conversation.lastMessage();
        const createdAt = conversation.createdAt;

        let sortTime = Date.now();

        if (lastMessage) {
          const message = lastMessage as { sentAt?: Date; sentAtNs?: bigint };
          if (message.sentAt) {
            sortTime = message.sentAt.getTime();
          } else if (message.sentAtNs) {
            sortTime = Number(message.sentAtNs) / 1_000_000;
          }
        } else if (createdAt) {
          sortTime = createdAt.getTime();
        }

        return {
          conversation,
          sortTime,
        };
      } catch {
        const createdAt = conversation.createdAt;
        return {
          conversation,
          sortTime: createdAt ? createdAt.getTime() : Date.now(),
        };
      }
    }),
  );

  return conversationsWithDates
    .sort((a, b) => b.sortTime - a.sortTime)
    .map((item) => item.conversation);
}
