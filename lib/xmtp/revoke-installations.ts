import { Client } from "@xmtp/browser-sdk";
import { createEphemeralSigner } from "./signer";
import type { Hex } from "viem";
import { getOrCreateEphemeralAccountKey } from "./signer";

export async function revokeAllInstallations(
  accountKey: Hex,
  inboxId: string,
  env: "production" | "dev" | "local" = "production",
) {
  console.log(`[revokeAllInstallations] Getting inbox state for ${inboxId}`);
  const inboxStates = await Client.inboxStateFromInboxIds([inboxId], env, true);
  
  if (inboxStates.length === 0) {
    throw new Error("Inbox state not found");
  }

  const inboxState = inboxStates[0];
  console.log(`[revokeAllInstallations] Found ${inboxState.installations.length} installations`);

  if (inboxState.installations.length === 0) {
    console.log("[revokeAllInstallations] No installations to revoke");
    return;
  }

  const installationBytes = inboxState.installations.map((i) => i.bytes);
  console.log(`[revokeAllInstallations] Revoking ${installationBytes.length} installations`);

  const signer = createEphemeralSigner(accountKey);
  await Client.revokeInstallations(signer, inboxId, installationBytes, env);
  
  console.log("[revokeAllInstallations] Successfully revoked all installations");
}

export async function revokeAllInstallationsForCurrentAccount(
  env: "production" | "dev" | "local" = "production",
) {
  const accountKey = getOrCreateEphemeralAccountKey();
  const signer = createEphemeralSigner(accountKey);
  
  const identifier = signer.getIdentifier();
  console.log(`[revokeAllInstallationsForCurrentAccount] Finding inbox for ${identifier.identifier}`);
  
  const inboxId = await Client.findInboxIdByIdentifier(identifier, env);
  if (!inboxId) {
    throw new Error("Inbox ID not found for current account");
  }

  console.log(`[revokeAllInstallationsForCurrentAccount] Found inbox ID: ${inboxId}`);
  await revokeAllInstallations(accountKey, inboxId, env);
}
