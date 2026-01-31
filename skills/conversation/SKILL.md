---
name: conversation
description: Single conversation operations in React apps using XMTP browser SDK. Use when loading messages, sending messages, or managing group members. Triggers on useConversation, messages, send, or group members.
---

# XMTP conversation hook

All-in-one hook for single conversation operations: messages, sending, and group management.

## When to apply

Reference these guidelines when:
- Loading messages for a conversation
- Sending text messages
- Managing group members (add/remove)
- Detecting group vs DM conversations
- Streaming new messages in real-time

## Quick reference

- `useConversation(conversationId, client)` - Main hook
- Returns `{ conversation, messages, send, isLoading, error, isGroup, members, addMember, removeMember }`
- Auto-streams new messages
- Handles message deduplication

## Quick start

```typescript
function Chat({ conversationId }) {
  const { client } = useClient();
  const {
    messages,
    send,
    isLoading,
    isGroup,
    members,
    addMember,
    removeMember,
  } = useConversation(conversationId, client);

  const handleSend = async (text: string) => {
    await send(text);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <span>{msg.senderInboxId}: </span>
          <span>{String(msg.content)}</span>
        </div>
      ))}
      <input onSubmit={(e) => handleSend(e.target.value)} />
    </div>
  );
}
```

## Message type

```typescript
type Message = {
  id: string;
  senderInboxId: string;
  content: unknown;
  contentType?: ContentTypeId;
  sentAt?: Date;
};
```

## Implementation snippets

**Load conversation and messages:**

```typescript
export function useConversation(
  conversationId: string | null | undefined,
  client: Client | null,
) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);

  // Load conversation
  useEffect(() => {
    if (!client || !conversationId) {
      setConversation(null);
      return;
    }

    client.conversations.getConversationById(conversationId).then((conv) => {
      setConversation(conv || null);
    });
  }, [client, conversationId]);

  // Load messages and stream
  useEffect(() => {
    if (!conversation) return;
    let mounted = true;

    const setup = async () => {
      await conversation.sync();
      const existing = await conversation.messages();
      setMessages(existing.map(toMessage));

      // Load members for groups
      if (conversation instanceof Group) {
        setMembers(await conversation.members());
      }

      // Stream new messages
      const stream = await conversation.stream({
        onValue: (msg) => {
          if (!mounted) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, toMessage(msg)];
          });
        },
      });

      return () => stream.end();
    };

    const cleanup = setup();
    return () => {
      mounted = false;
      cleanup.then((end) => end?.());
    };
  }, [conversation]);

  // ...
}
```

**Send message:**

```typescript
const send = useCallback(async (content: string) => {
  if (!conversation) throw new Error("No conversation selected");
  await conversation.send(content);
}, [conversation]);
```

**Add group member:**

```typescript
const addMember = useCallback(async (address: string) => {
  if (!(conversation instanceof Group)) {
    throw new Error("Can only add members to group conversations");
  }

  await conversation.addMembersByIdentifiers([{
    identifier: address.toLowerCase(),
    identifierKind: "Ethereum",
  }]);

  // Refresh members
  setMembers(await conversation.members());
}, [conversation]);
```

**Remove group member:**

```typescript
const removeMember = useCallback(async (inboxId: string) => {
  if (!(conversation instanceof Group)) {
    throw new Error("Can only remove members from group conversations");
  }

  await conversation.removeMembers([inboxId]);
  setMembers(await conversation.members());
}, [conversation]);
```

**Extract sentAt timestamp:**

```typescript
function getMessageSentAt(msg: DecodedMessage): Date | undefined {
  // Handle both sentAt and sentAtNs formats
  if (msg.sentAt) return msg.sentAt;
  if (msg.sentAtNs) return new Date(Number(msg.sentAtNs) / 1_000_000);
  return undefined;
}
```

## Key patterns

**Sync before read:** Call `conversation.sync()` before loading messages

**Deduplication:** Check message ID exists before adding to prevent duplicates

**Group detection:** Use `conversation instanceof Group` to check type

**Member management:** Only available for Group conversations, not DMs
