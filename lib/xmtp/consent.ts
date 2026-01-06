import type { Conversation, Client } from "@xmtp/browser-sdk";
import { Group, Dm, ConsentState } from "@xmtp/browser-sdk";
import type { ContentTypes } from "@/lib/xmtp/client";

/**
 * Get consent state for a Group conversation.
 * NOTE: consentState is a function that returns Promise<ConsentState>, not a property.
 */
export async function getGroupConsentState(
  group: Group,
): Promise<ConsentState> {
  return await group.consentState();
}

/**
 * Check if a Group conversation is denied.
 */
export async function isGroupDenied(group: Group): Promise<boolean> {
  const state = await getGroupConsentState(group);
  return state === ConsentState.Denied;
}

/**
 * Check if a DM peer is allowed.
 */
export async function isDmPeerAllowed(
  dm: Dm,
  client: Client<ContentTypes>,
): Promise<boolean> {
  const peerInboxId = dm.peerInboxId as unknown as string;
  if (!peerInboxId) {
    return true;
  }
  return await (client.preferences as any).isAllowed(peerInboxId);
}

/**
 * Check if a conversation is allowed (not denied/blocked).
 */
export async function isConversationAllowed(
  conversation: Conversation,
  client: Client<ContentTypes>,
): Promise<boolean> {
  if (conversation instanceof Group) {
    return !(await isGroupDenied(conversation));
  }
  if (conversation instanceof Dm) {
    return await isDmPeerAllowed(conversation, client);
  }
  return true;
}
