# Agent Mini App Hooks

Minimal React hooks for building XMTP agent mini apps. Simple, composable hooks for all XMTP operations.

## Installation

```bash
npm install agent-mini-app-hooks
# or
yarn add agent-mini-app-hooks
```

## Quick Start

```tsx
import { useClient } from "@xmtp/hooks/use-client";
import { useConversations } from "@xmtp/hooks/use-conversations";
import { useConversation } from "@xmtp/hooks/use-conversation";

function MyAgentApp() {
  const { client, isLoading } = useClient();
  const { conversations } = useConversations(client);
  const { messages, send } = useConversation(conversationId, client);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => send("Hello!")}>Send</button>
    </div>
  );
}
```

## Hooks API

### `useClient()`

Initialize XMTP client. Returns singleton client instance.

**Import:**

```tsx
import { useClient } from "@xmtp/hooks/use-client";
```

**Returns:**

- `client` - XMTP Client instance (null if loading/error)
- `isLoading` - boolean
- `error` - Error | null

**Example:**

```tsx
const { client, isLoading, error } = useClient();
```

---

### `useConversations(client)`

List and manage all conversations.

**Import:**

```tsx
import { useConversations } from "@xmtp/hooks/use-conversations";
```

**Parameters:**

- `client` - XMTP Client (from `useClient`)

**Returns:**

- `conversations` - Conversation[] - Array of all conversations
- `isLoading` - boolean
- `error` - Error | null
- `refresh` - () => Promise<void> - Manually refresh conversations

**Example:**

```tsx
const { client } = useClient();
const { conversations, isLoading, refresh } = useConversations(client);

// Refresh conversations
await refresh();
```

---

### `useConversation(conversationId, client)`

**All-in-one hook for conversation operations.** Handles messages, sending, members, and group operations.

**Import:**

```tsx
import { useConversation } from "@xmtp/hooks/use-conversation";
```

**Parameters:**

- `conversationId` - string | null | undefined
- `client` - XMTP Client (from `useClient`)

**Returns:**

- `conversation` - Conversation | null - The conversation object
- `messages` - Message[] - All messages in conversation
- `send` - (content: string) => Promise<void> - Send a message
- `isLoading` - boolean
- `error` - Error | null
- `isGroup` - boolean - True if group conversation
- `members` - GroupMember[] - Members (empty for DM)
- `addMember` - (address: string) => Promise<void> - Add member (group only)
- `removeMember` - (inboxId: string) => Promise<void> - Remove member (group only)

**Example:**

```tsx
const { client } = useAgentClient();
const { messages, send, isGroup, members, addMember } = useAgentConversation(
  conversationId,
  client,
);

// Send message
await send("Hello!");

// Add member to group
if (isGroup) {
  await addMember("0x123...");
}
```

---

### `useConversationMembers(conversationId, client)`

Get members in a conversation. Returns raw XMTP members data.

**Import:**

```tsx
import { useConversationMembers } from "@xmtp/hooks/use-conversation-members";
import { matchAgentsFromMembers } from "@xmtp/utils";
```

**Parameters:**

- `conversationId` - string | null | undefined
- `client` - XMTP Client (from `useClient`)

**Returns:**

- `members` - GroupMember[] - Members in conversation
- `isLoading` - boolean
- `error` - Error | null

**Example:**

```tsx
import { useConversationMembers } from "@xmtp/hooks/use-conversation-members";
import { matchAgentsFromMembers } from "@xmtp/utils";
import { AI_AGENTS } from "@/src/agents";

const { client } = useClient();
const { members } = useConversationMembers(conversationId, client);

// Match agents from members (business logic in utility)
const agents = matchAgentsFromMembers(members, AI_AGENTS);
```

---

### `useAgentSelection()`

Simple state hook for managing selected agents.

**Returns:**

- `selectedAgents` - AgentConfig[]
- `setSelectedAgents` - (agents: AgentConfig[]) => void
- `addAgent` - (agent: AgentConfig) => void
- `removeAgent` - (address: string) => void
- `clearSelection` - () => void

**Example:**

```tsx
const { selectedAgents, addAgent, removeAgent } = useAgentSelection();
```

## Complete Example

```tsx
import { useClient } from "@xmtp/hooks/use-client";
import { useConversations } from "@xmtp/hooks/use-conversations";
import { useConversation } from "@xmtp/hooks/use-conversation";

function ChatApp() {
  const { client, isLoading: clientLoading } = useClient();
  const { conversations } = useConversations(client);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    messages,
    send,
    isLoading: convLoading,
  } = useConversation(selectedId, client);

  if (clientLoading) return <div>Connecting...</div>;

  return (
    <div>
      <aside>
        {conversations.map((conv) => (
          <button key={conv.id} onClick={() => setSelectedId(conv.id)}>
            {conv.id}
          </button>
        ))}
      </aside>

      <main>
        {convLoading ? (
          <div>Loading messages...</div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id}>{msg.content}</div>
            ))}
            <input
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  send(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
```

## TypeScript

All hooks are fully typed. Import types as needed:

```tsx
// XMTP types from browser-sdk
import type {
  Conversation,
  Group,
  DecodedMessage,
  Client,
} from "@xmtp/browser-sdk";

// Message type from conversation hook
import type { Message } from "@xmtp/hooks/use-conversation";

// Content types
import type { ContentTypes } from "@xmtp/utils";

// Agent config
import type { AgentConfig } from "@/src/agents";
```

## Architecture

**Hooks are generic data fetchers only.** Business logic (agent matching, role assignment, filtering) belongs in utilities or components.

- Hooks return raw XMTP data
- Utilities handle business logic (e.g., `matchAgentsFromMembers`, `assignMessageRole`)
- Components compose hooks with utilities

This ensures hooks are reusable, testable, and maintain clear separation of concerns.

## License

MIT
