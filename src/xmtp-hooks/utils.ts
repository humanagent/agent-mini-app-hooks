import { Client, type ExtractCodecContentTypes } from "@xmtp/browser-sdk";
import { MarkdownCodec } from "@xmtp/content-type-markdown";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { ReplyCodec } from "@xmtp/content-type-reply";
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference";
import { WalletSendCallsCodec } from "@xmtp/content-type-wallet-send-calls";
import type { Signer, GroupMember, DecodedMessage } from "@xmtp/browser-sdk";
import { toBytes, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Group, ConsentState, ConsentEntityType } from "@xmtp/browser-sdk";
import type { Conversation } from "@xmtp/browser-sdk";
import type { AgentConfig } from "./agents";

type PrivateKey = Hex;

export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export function deduplicateConversations<T extends { id: string }>(
  conversations: T[],
): T[] {
  return Array.from(new Map(conversations.map((c) => [c.id, c])).values());
}

export type ContentTypes = ExtractCodecContentTypes<
  [
    ReactionCodec,
    ReplyCodec,
    RemoteAttachmentCodec,
    TransactionReferenceCodec,
    WalletSendCallsCodec,
    ReadReceiptCodec,
    MarkdownCodec,
  ]
>;

export const createEphemeralSigner = (privateKey: Hex): Signer => {
  const account = privateKeyToAccount(privateKey);
  const signer = {
    type: "EOA" as const,
    getIdentifier: () => {
      return {
        identifier: account.address.toLowerCase(),
        identifierKind: "Ethereum" as const,
      };
    },
    signMessage: async (message: string) => {
      const signature = await account.signMessage({
        message,
      });
      return toBytes(signature);
    },
  };
  return signer;
};

let accountKeyCache: PrivateKey | null = null;

export function getOrCreateEphemeralAccountKey(): PrivateKey {
  if (typeof window === "undefined") {
    throw new Error(
      "Ephemeral account key can only be created in browser environment",
    );
  }

  if (accountKeyCache) {
    return accountKeyCache;
  }

  const STORAGE_KEY = "xmtp-ephemeral-account-key";
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    accountKeyCache = stored as PrivateKey;
    return accountKeyCache;
  }
  const newKey = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, newKey);
  accountKeyCache = newKey;
  return newKey;
}

export function clearEphemeralAccountKey(): void {
  console.log("[XMTP] Clearing ephemeral account key cache and storage");
  accountKeyCache = null;
  const STORAGE_KEY = "xmtp-ephemeral-account-key";
  localStorage.removeItem(STORAGE_KEY);
}

let isCreatingClient = false;

export async function createXMTPClient(
  privateKey: PrivateKey,
): Promise<Client<ContentTypes>> {
  if (typeof window === "undefined") {
    throw new Error("XMTP client can only be created in browser environment");
  }

  if (isCreatingClient) {
    throw new Error(
      "XMTP client creation already in progress. Only one client can be created at a time due to OPFS limitations.",
    );
  }

  isCreatingClient = true;

  try {
    const signer = createEphemeralSigner(privateKey);
    const codecs = [
      new ReactionCodec(),
      new ReplyCodec(),
      new RemoteAttachmentCodec(),
      new TransactionReferenceCodec(),
      new WalletSendCallsCodec(),
      new ReadReceiptCodec(),
      new MarkdownCodec(),
    ];

    const startTime = Date.now();
    const clientPromise = Client.create(signer, {
      env: "production",
      appVersion: "xmtp-agents/0",
      codecs,
    });

    const client = await clientPromise;

    const duration = Date.now() - startTime;
    console.log(
      `[XMTP] Client created in ${duration}ms (inbox: ${client.inboxId?.slice(0, 8) ?? "unknown"}...)`,
    );

    isCreatingClient = false;
    return client;
  } catch (error) {
    console.error(`[XMTP] Failed to create client:`, error);
    if (error instanceof Error) {
      console.error("[XMTP] Error name:", error.name);
      console.error("[XMTP] Error message:", error.message);
      console.error("[XMTP] Error stack:", error.stack);
      if (error.cause) {
        console.error("[XMTP] Error cause:", error.cause);
      }
    }
    try {
      console.error(
        "[XMTP] Full error object:",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
    } catch {
      console.error("[XMTP] Could not stringify error object");
    }
    isCreatingClient = false;
    throw error;
  }
}

export async function isConversationAllowed(
  conversation: Conversation,
  _client: Client<ContentTypes>,
): Promise<boolean> {
  if (conversation instanceof Group) {
    const state = await conversation.consentState();
    return state !== ConsentState.Denied;
  }
  return true;
}

export async function denyConversation(
  conversation: Conversation,
  client: Client<ContentTypes>,
): Promise<void> {
  await client.preferences.setConsentStates([
    {
      entity: conversation.id,
      entityType: ConsentEntityType.GroupId,
      state: ConsentState.Denied,
    },
  ]);
}

export async function createGroupWithAgentAddresses(
  client: Client<ContentTypes>,
  addresses: string[],
): Promise<Group> {
  if (!addresses || addresses.length === 0) {
    throw new Error("No addresses provided for group creation");
  }

  const identifiers = addresses.map((address) => ({
    identifier: address.toLowerCase(),
    identifierKind: "Ethereum" as const,
  }));

  const group = await client.conversations.newGroupWithIdentifiers(
    identifiers,
    {
      name: "Agent Group",
    },
  );

  return group;
}

// Business logic utilities

/**
 * Extracts Ethereum addresses from group members
 */
export function extractMemberAddresses(members: GroupMember[]): string[] {
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

/**
 * Matches group members against an agent list
 * Returns agents whose addresses match member addresses
 */
export function matchAgentsFromMembers(
  members: GroupMember[],
  agentList: AgentConfig[],
): AgentConfig[] {
  const memberAddresses = new Set(extractMemberAddresses(members));
  return agentList.filter((agent) =>
    memberAddresses.has(agent.address.toLowerCase()),
  );
}

/**
 * Assigns a role to a message based on sender
 * @param message - The decoded message
 * @param clientInboxId - The current client's inbox ID
 * @param options - Optional role names (defaults to "user" and "assistant")
 * @returns The assigned role
 */
export function assignMessageRole(
  message: DecodedMessage<unknown>,
  clientInboxId: string,
  _options?: { userRole?: string; assistantRole?: string },
): "user" | "assistant" {
  const isFromClient = message.senderInboxId === clientInboxId;
  return isFromClient ? "user" : "assistant";
}
