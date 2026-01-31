---
name: client
description: XMTP client initialization for React apps using browser SDK. Use when setting up XMTP, creating client instances, or handling ephemeral accounts. Triggers on useClient, XMTP initialization, or browser SDK setup.
---

# XMTP client hook

Initialize and manage XMTP client instances in React applications using the browser SDK.

## When to apply

Reference these guidelines when:
- Initializing XMTP client in a React app
- Using ephemeral accounts for anonymous users
- Integrating wallet signers for authenticated users
- Managing client singleton across components

## Quick reference

- `useClient(signer?, options?)` - Main hook for client initialization
- Returns `{ client, isLoading, error }`
- Singleton pattern - shared across all components
- Ephemeral key stored in localStorage

## Quick start

```typescript
function App() {
  // Default: uses ephemeral account (anonymous)
  const { client, isLoading, error } = useClient();

  if (isLoading) return <div>Connecting to XMTP...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!client) return <div>No client</div>;

  return <div>Connected: {client.inboxId}</div>;
}
```

**With wallet signer:**

```typescript
function App({ walletSigner }) {
  const { client, isLoading, error } = useClient(walletSigner, {
    env: "production",
  });

  // ...
}
```

## Implementation snippets

**Singleton pattern:**

```typescript
let globalClient: Client | null = null;
let globalClientPromise: Promise<Client> | null = null;
const subscribers = new Set<(client: Client | null, error: Error | null) => void>();

async function initializeClient(signer?: Signer): Promise<Client> {
  if (globalClient) return globalClient;
  if (globalClientPromise) return globalClientPromise;

  globalClientPromise = createXMTPClient(signer).then((client) => {
    globalClient = client;
    subscribers.forEach((sub) => sub(client, null));
    return client;
  });

  return globalClientPromise;
}
```

**Ephemeral account key:**

```typescript
const STORAGE_KEY = "xmtp-ephemeral-account-key";

function getOrCreateEphemeralAccountKey(): Hex {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored as Hex;

  const newKey = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, newKey);
  return newKey;
}

function createEphemeralSigner(privateKey: Hex): Signer {
  const account = privateKeyToAccount(privateKey);
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: account.address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await account.signMessage({ message });
      return toBytes(signature);
    },
  };
}
```

**Hook implementation:**

```typescript
export function useClient(signer?: Signer, options?: XMTPClientOptions) {
  const [client, setClient] = useState<Client | null>(globalClient);
  const [isLoading, setIsLoading] = useState(!globalClient);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (globalClient) {
      setClient(globalClient);
      setIsLoading(false);
      return;
    }

    const subscriber = (newClient: Client | null, newError: Error | null) => {
      setClient(newClient);
      setError(newError);
      setIsLoading(false);
    };

    subscribers.add(subscriber);
    initializeClient(signer, options).catch((err) => {
      setError(toError(err));
      setIsLoading(false);
    });

    return () => subscribers.delete(subscriber);
  }, [signer, options]);

  return { client, isLoading, error };
}
```

## Key patterns

**Browser-only:** Client can only be created in browser (uses OPFS for storage)

**OPFS limitation:** Only one client can be created at a time - singleton prevents conflicts

**Ephemeral vs wallet:** Use ephemeral for anonymous users, wallet signer for authenticated users
