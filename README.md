# Agent mini-app hooks

Minimal React hooks for building XMTP agent mini apps. Simple, composable hooks for all XMTP operations.

![](./main.png)

## Quick start

```tsx
import { useClient } from "@/src/xmtp-hooks/use-client";
import { useConversations } from "@/src/xmtp-hooks/use-conversations";
import { useConversation } from "@/src/xmtp-hooks/use-conversation";

function MyAgentApp() {
  const { client, isLoading } = useClient();
  const { conversations } = useConversations(client);
  const { messages, send } = useConversation(conversationId, client);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{String(msg.content)}</div>
      ))}
      <button type="button" onClick={() => send("Hello!")}>Send</button>
    </div>
  );
}
```

## Hooks API

### `useClient(signer?, options?)`

Initialize XMTP client. Returns a singleton client. Without a signer, uses an ephemeral account key stored in localStorage.

**Import:**

```tsx
import { useClient } from "@/src/xmtp-hooks/use-client";
```

**Parameters:**

- `signer` - `Signer | undefined` - Optional. Omit for ephemeral (anonymous) user; pass wallet signer for authenticated user.
- `options` - `XMTPClientOptions | undefined` - Optional. `{ env?: "dev" | "production" | "local"; appVersion?: string }`

**Returns:**

- `client` - `Client<ContentTypes> | null` - XMTP client (null while loading or on error)
- `isLoading` - `boolean` - Loading state
- `error` - `Error | null` - Set if initialization fails

**Example:**

```tsx
// Ephemeral (anonymous)
const { client, isLoading, error } = useClient();

// With wallet signer
const { client, isLoading, error } = useClient(walletSigner, { env: "production" });
```

**Notes:**

- Client is a singleton; multiple calls share the same instance.
- Browser-only (uses OPFS). Only one client at a time.
- Ephemeral key is stored in localStorage when no signer is provided.

---

### `useConversations(client)`

List and manage all conversations. Filters out denied/blocked conversations and streams new ones.

**Import:**

```tsx
import { useConversations } from "@/src/xmtp-hooks/use-conversations";
```

**Parameters:**

- `client` - `Client<ContentTypes> | null` - XMTP client from `useClient`

**Returns:**

- `conversations` - `Conversation[]` - Allowed conversations only
- `isLoading` - `boolean` - Loading state
- `error` - `Error | null` - Set if fetch fails
- `refresh` - `() => Promise<void>` - Reload and re-filter conversations

**Example:**

```tsx
const { client } = useClient();
const { conversations, isLoading, refresh } = useConversations(client);

await refresh();
```

**Notes:**

- Calls `client.conversations.sync()` before listing.
- Filters out group conversations with denied consent.
- Deduplicates by conversation ID; streams new conversations in real time.

---

### `useConversation(conversationId, client)`

Single-conversation hook: messages, send, and (for groups) members and add/remove.

**Import:**

```tsx
import { useConversation } from "@/src/xmtp-hooks/use-conversation";
```

**Parameters:**

- `conversationId` - `string | null | undefined` - Conversation ID
- `client` - `Client<ContentTypes> | null` - XMTP client from `useClient`

**Returns:**

- `conversation` - `Conversation | null` - Conversation instance
- `messages` - `Message[]` - Messages (sync then stream)
- `send` - `(content: string) => Promise<void>` - Send text
- `isLoading` - `boolean` - Loading state
- `error` - `Error | null` - Set if operation fails
- `isGroup` - `boolean` - True when conversation is a group
- `members` - `GroupMember[]` - Members (empty for DM)
- `addMember` - `(address: string) => Promise<void>` - Add by Ethereum address (group only)
- `removeMember` - `(inboxId: string) => Promise<void>` - Remove by inbox ID (group only)

**Message type:**

```tsx
type Message = {
  id: string;
  senderInboxId: string;
  content: unknown;
  contentType?: ContentTypeId;
  sentAt?: Date;
};
```

Derive "user" vs "assistant" by comparing `senderInboxId` to `client.inboxId`.

**Example:**

```tsx
const { client } = useClient();
const {
  conversation,
  messages,
  send,
  isGroup,
  members,
  addMember,
  removeMember,
} = useConversation(conversationId, client);

await send("Hello!");

if (isGroup) {
  await addMember("0x123...");
  await removeMember("inboxId123");
}
```

**Notes:**

- Syncs conversation before loading messages; then streams new messages.
- Deduplicates by message ID. Use `conversation instanceof Group` for group-only logic.

---

### `useConversationMembers(conversationId, client)`

Load conversation members. Returns raw XMTP `GroupMember[]`; empty array for DMs.

**Import:**

```tsx
import { useConversationMembers } from "@/src/xmtp-hooks/use-conversation-members";
import { extractMemberAddresses } from "@/src/xmtp-hooks/utils";
```

**Parameters:**

- `conversationId` - `string | null | undefined` - Conversation ID
- `client` - `Client<ContentTypes> | null` - XMTP client from `useClient`

**Returns:**

- `members` - `GroupMember[]` - Members (empty for DM)
- `isLoading` - `boolean` - Loading state
- `error` - `Error | null` - Set if fetch fails

**Example:**

```tsx
const { client } = useClient();
const { members, isLoading } = useConversationMembers(conversationId, client);
const addresses = extractMemberAddresses(members);
```

---

### `useAgentSelection()`

Local state for selected agents (e.g. for multi-agent chat). No XMTP client required.

**Import:**

```tsx
import { useAgentSelection } from "@/src/xmtp-hooks/use-agent-selection";
```

**Returns:**

- `selectedAgents` - `AgentConfig[]` - Current selection
- `setSelectedAgents` - `(agents: AgentConfig[]) => void` - Set full list
- `addAgent` - `(agent: AgentConfig) => void` - Add one (no duplicates by address)
- `removeAgent` - `(address: string) => void` - Remove by Ethereum address
- `clearSelection` - `() => void` - Clear all

**Example:**

```tsx
const { selectedAgents, addAgent, removeAgent, clearSelection } =
  useAgentSelection();

addAgent(agentConfig);
removeAgent("0x123...");
clearSelection();
```

---

## Utilities

From `@/src/xmtp-hooks/utils`:

| Utility | Purpose |
|--------|---------|
| `createXMTPClient(signer, options?)` | Create client with built-in codecs (reaction, reply, remote attachment, etc.). Browser-only. |
| `createEphemeralSigner(privateKey)` | Build signer from hex private key. |
| `getOrCreateEphemeralAccountKey()` | Get or create ephemeral key in localStorage. |
| `clearEphemeralAccountKey()` | Clear cached key and localStorage. |
| `isConversationAllowed(conversation, client)` | Consent check; denied groups return false. |
| `denyConversation(conversation, client)` | Set conversation consent to denied. |
| `extractMemberAddresses(members)` | Ethereum addresses from `GroupMember[]`. |
| `deduplicateConversations(conversations)` | Dedupe by `id`. |
| `toError(err)` | Normalize unknown to `Error`. |

Client creation uses Reaction, Reply, RemoteAttachment, TransactionReference, WalletSendCalls, ReadReceipt, and Markdown codecs.

## Components

Reusable React components for building XMTP agent mini apps.

### `InputArea`

Message input component with agent selection, plus panel, and agent chips.

**Import:**

```tsx
import { InputArea } from "@/src/components/input-area";
```

**Props:**

- `selectedAgents?` - `AgentConfig[]` - Selected agents (for chat area mode)
- `setSelectedAgents?` - `(agents: AgentConfig[]) => void` - Set selected agents
- `sendMessage?` - `(content: string, agents?: AgentConfig[]) => void` - Send message callback
- `conversation?` - `Conversation | null` - Active conversation (for message list mode)
- `openAgentsDialog?` - `boolean` - Control plus panel visibility
- `onOpenAgentsDialogChange?` - `(open: boolean) => void` - Plus panel change handler

**Example:**

```tsx
<InputArea
  selectedAgents={selectedAgents}
  setSelectedAgents={setSelectedAgents}
  sendMessage={(content, agents) => {
    void handleSendMessage(content, agents);
  }}
  conversation={conversation}
/>
```

**Notes:**

- Supports two modes: chat area (multi-agent selection) and message list (conversation-based)
- Plus panel opens with CMD/CTRL + K shortcut
- Automatically matches agents from conversation members in message list mode

---

### `MessageList` / `ConversationView`

Message display and conversation management component.

**Import:**

```tsx
import { MessageList, ConversationView } from "@/src/components/message-list";
```

**MessageList Props:**

- `messages` - `Message[]` - Array of messages to display
- `onMentionClick?` - `(agent: AgentConfig) => void` - Click handler for agent mentions
- `isGroup?` - `boolean` - Whether conversation is a group
- `conversationId?` - `string` - Conversation ID for member matching

**ConversationView Props:**

- `initialAgents?` - `AgentConfig[]` - Initial agents for new conversations
- `customGreeting?` - `React.ReactNode` - Custom greeting component

**Example:**

```tsx
<ConversationView
  initialAgents={selectedAgents}
  customGreeting={<CustomGreeting />}
/>
```

**Notes:**

- Automatically handles message streaming and optimistic updates
- Creates conversations on first message send
- Supports both DM and group conversations

---

### `Sidebar`

Navigation sidebar with conversations list and user nav.

**Import:**

```tsx
import { Sidebar } from "@/src/components/sidebar";
```

**Example:**

```tsx
<Sidebar />
```

**Notes:**

- Automatically sorts conversations by last message
- Handles conversation deletion via deny
- Mobile-responsive with drawer behavior
- Integrates with routing for navigation

---

### `Greeting`

Empty state greeting component for chat area.

**Import:**

```tsx
import { Greeting } from "@/src/components/chat-area";
```

**Props:**

- `onOpenAgents?` - `() => void` - Callback to open agent selection

**Example:**

```tsx
<Greeting
  onOpenAgents={() => {
    setOpenAgentsDialog(true);
  }}
/>
```

## Documentation

The `skills/` directory holds implementation notes, when-to-apply guidance, and key patterns for the hooks and utilities (not for components or `useAgentSelection`).

| Skill | Scope |
|-------|--------|
| `skills/client/SKILL.md` | XMTP client setup, ephemeral vs wallet, singleton, OPFS; when initializing client or using browser SDK |
| `skills/conversation/SKILL.md` | Single conversation: messages, send, group members; when loading/sending or managing members |
| `skills/conversations/SKILL.md` | Conversation list, consent filtering, streaming; when building inbox/sidebar or filtering blocked |
| `skills/members/SKILL.md` | Conversation members and address extraction; when showing member lists or resolving addresses |
| `skills/utilities/SKILL.md` | Client creation, codecs, consent, ephemeral signer; when creating clients or managing consent |

Hooks `useAgentSelection` and the Components section are documented only in this README.
