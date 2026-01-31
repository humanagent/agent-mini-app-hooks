---
name: conversations
description: List and manage XMTP conversations in React apps. Use when displaying conversation lists, filtering blocked conversations, or streaming new conversations. Triggers on useConversations, conversation list, or inbox.
---

# XMTP conversations hook

List and manage all conversations with real-time streaming and consent filtering.

## When to apply

Reference these guidelines when:
- Displaying a list of conversations
- Filtering out blocked/denied conversations
- Streaming new incoming conversations
- Building an inbox or sidebar

## Quick reference

- `useConversations(client)` - Main hook for conversation list
- Returns `{ conversations, isLoading, error, refresh }`
- Auto-filters denied conversations
- Deduplicates by conversation ID
- Streams new conversations in real-time

## Quick start

```typescript
function Inbox() {
  const { client } = useClient();
  const { conversations, isLoading, error, refresh } = useConversations(client);

  if (isLoading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      {conversations.map((conv) => (
        <div key={conv.id}>{conv.id}</div>
      ))}
    </div>
  );
}
```

## Implementation snippets

**Filter allowed conversations:**

```typescript
async function filterAllowedConversations(
  conversations: Conversation[],
  client: Client,
): Promise<Conversation[]> {
  const allowed: Conversation[] = [];

  for (const conversation of conversations) {
    try {
      const isAllowed = await isConversationAllowed(conversation, client);
      if (isAllowed) allowed.push(conversation);
    } catch {
      // Allow by default on error
      allowed.push(conversation);
    }
  }

  return allowed;
}
```

**Check conversation consent:**

```typescript
import { Group, ConsentState } from "@xmtp/browser-sdk";

async function isConversationAllowed(
  conversation: Conversation,
  client: Client,
): Promise<boolean> {
  if (conversation instanceof Group) {
    const state = await conversation.consentState();
    return state !== ConsentState.Denied;
  }
  return true; // DMs are always allowed
}
```

**Hook with streaming:**

```typescript
export function useConversations(client: Client | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;
    let mounted = true;

    const init = async () => {
      setIsLoading(true);
      await client.conversations.sync();
      const all = await client.conversations.list();
      const unique = deduplicateConversations(all);
      const allowed = await filterAllowedConversations(unique, client);
      if (mounted) {
        setConversations(allowed);
        setIsLoading(false);
      }

      // Stream new conversations
      const stream = await client.conversations.stream({
        onValue: async (conversation) => {
          if (!mounted) return;
          const isAllowed = await isConversationAllowed(conversation, client);
          if (!isAllowed) return;

          setConversations((prev) => {
            const map = new Map(prev.map((c) => [c.id, c]));
            map.set(conversation.id, conversation);
            return Array.from(map.values());
          });
        },
      });

      return () => stream.end();
    };

    const cleanup = init();
    return () => {
      mounted = false;
      cleanup.then((end) => end?.());
    };
  }, [client]);

  const refresh = useCallback(async () => {
    if (!client) return;
    await client.conversations.sync();
    const all = await client.conversations.list();
    const allowed = await filterAllowedConversations(
      deduplicateConversations(all),
      client,
    );
    setConversations(allowed);
  }, [client]);

  return { conversations, isLoading, error, refresh };
}
```

**Deduplication helper:**

```typescript
function deduplicateConversations<T extends { id: string }>(
  conversations: T[],
): T[] {
  return Array.from(new Map(conversations.map((c) => [c.id, c])).values());
}
```

## Key patterns

**Sync before list:** Always call `client.conversations.sync()` before listing

**Real-time updates:** Use `client.conversations.stream()` to receive new conversations

**Consent filtering:** Filter out denied group conversations for privacy
