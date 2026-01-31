---
name: members
description: Fetch conversation members in React apps using XMTP browser SDK. Use when displaying member lists or extracting Ethereum addresses. Triggers on useConversationMembers, group members, or member addresses.
---

# XMTP conversation members hook

Simple hook for fetching conversation members with address extraction utilities.

## When to apply

Reference these guidelines when:
- Displaying group member lists
- Extracting Ethereum addresses from members
- Checking who is in a conversation

## Quick reference

- `useConversationMembers(conversationId, client)` - Main hook
- Returns `{ members, isLoading, error }`
- Returns empty array for DM conversations
- `extractMemberAddresses(members)` - Get Ethereum addresses

## Quick start

```typescript
function MemberList({ conversationId }) {
  const { client } = useClient();
  const { members, isLoading, error } = useConversationMembers(
    conversationId,
    client,
  );

  if (isLoading) return <div>Loading members...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const addresses = extractMemberAddresses(members);

  return (
    <ul>
      {addresses.map((addr) => (
        <li key={addr}>{addr}</li>
      ))}
    </ul>
  );
}
```

## GroupMember type

```typescript
type GroupMember = {
  inboxId: string;
  accountIdentifiers: Array<{
    identifier: string;
    identifierKind: "Ethereum" | string;
  }>;
  // ... other properties
};
```

## Implementation snippets

**Hook implementation:**

```typescript
export function useConversationMembers(
  conversationId: string | null | undefined,
  client: Client | null,
) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client || !conversationId) {
      setMembers([]);
      return;
    }

    let mounted = true;

    const loadMembers = async () => {
      setIsLoading(true);
      setError(null);

      const conversation = await client.conversations.getConversationById(
        conversationId,
      );

      if (!conversation || !mounted) {
        if (mounted) {
          setMembers([]);
          setIsLoading(false);
        }
        return;
      }

      const conversationMembers = await conversation.members();

      if (mounted) {
        setMembers(conversationMembers);
        setIsLoading(false);
      }
    };

    loadMembers().catch((err) => {
      if (mounted) {
        setError(toError(err));
        setIsLoading(false);
        setMembers([]);
      }
    });

    return () => {
      mounted = false;
    };
  }, [client, conversationId]);

  return { members, isLoading, error };
}
```

**Extract Ethereum addresses:**

```typescript
function extractMemberAddresses(members: GroupMember[]): string[] {
  const addresses = new Set<string>();

  for (const member of members) {
    for (const identifier of member.accountIdentifiers) {
      if (identifier.identifierKind === "Ethereum") {
        addresses.add(identifier.identifier.toLowerCase());
      }
    }
  }

  return Array.from(addresses);
}
```

## Key patterns

**DM handling:** DMs don't have a members list - hook returns empty array

**Address extraction:** Members have `accountIdentifiers` array with different identifier kinds

**Lowercase addresses:** Always lowercase Ethereum addresses for comparison
