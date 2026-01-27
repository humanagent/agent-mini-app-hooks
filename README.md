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
import { 
  useAgentClient, 
  useAgentConversations, 
  useAgentConversation 
} from 'agent-mini-app-hooks';

function MyAgentApp() {
  const { client, isLoading } = useAgentClient();
  const { conversations } = useAgentConversations(client);
  const { messages, send } = useAgentConversation(conversationId, client);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
      <button onClick={() => send("Hello!")}>Send</button>
    </div>
  );
}
```

## Hooks API

### `useAgentClient()`

Initialize XMTP client. Returns singleton client instance.

**Returns:**
- `client` - XMTP Client instance (null if loading/error)
- `isLoading` - boolean
- `error` - Error | null

**Example:**
```tsx
const { client, isLoading, error } = useAgentClient();
```

---

### `useAgentConversations(client)`

List and manage all conversations.

**Parameters:**
- `client` - XMTP Client (from `useAgentClient`)

**Returns:**
- `conversations` - Conversation[] - Array of all conversations
- `isLoading` - boolean
- `error` - Error | null
- `refresh` - () => Promise<void> - Manually refresh conversations

**Example:**
```tsx
const { client } = useAgentClient();
const { conversations, isLoading, refresh } = useAgentConversations(client);

// Refresh conversations
await refresh();
```

---

### `useAgentConversation(conversationId, client)`

**All-in-one hook for conversation operations.** Handles messages, sending, members, and group operations.

**Parameters:**
- `conversationId` - string | null | undefined
- `client` - XMTP Client (from `useAgentClient`)

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
const { 
  messages, 
  send, 
  isGroup, 
  members, 
  addMember 
} = useAgentConversation(conversationId, client);

// Send message
await send("Hello!");

// Add member to group
if (isGroup) {
  await addMember("0x123...");
}
```

---

### `useAgentConversationAgents(conversationId, client)`

Get agents in a conversation (filters from known agent list).

**Parameters:**
- `conversationId` - string | null | undefined
- `client` - XMTP Client (from `useAgentClient`)

**Returns:**
- `agents` - AgentConfig[] - Agents found in conversation
- `isLoading` - boolean
- `error` - Error | null

**Example:**
```tsx
const { client } = useAgentClient();
const { agents } = useAgentConversationAgents(conversationId, client);
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
import { 
  useAgentClient,
  useAgentConversations,
  useAgentConversation 
} from 'agent-mini-app-hooks';

function ChatApp() {
  const { client, isLoading: clientLoading } = useAgentClient();
  const { conversations } = useAgentConversations(client);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { 
    messages, 
    send, 
    isLoading: convLoading 
  } = useAgentConversation(selectedId, client);
  
  if (clientLoading) return <div>Connecting...</div>;
  
  return (
    <div>
      <aside>
        {conversations.map(conv => (
          <button 
            key={conv.id} 
            onClick={() => setSelectedId(conv.id)}
          >
            {conv.id}
          </button>
        ))}
      </aside>
      
      <main>
        {convLoading ? (
          <div>Loading messages...</div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id}>{msg.content}</div>
            ))}
            <input 
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  send(e.currentTarget.value);
                  e.currentTarget.value = '';
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
import type { AgentConfig, Message } from 'agent-mini-app-hooks';
```

## License

MIT
