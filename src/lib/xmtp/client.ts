import {
  EphemeralSigner,
  Client as XMTPClient,
  type Client,
} from "@xmtp/browser-sdk";

export async function createXMTPClient(
  accountKey: Uint8Array,
): Promise<Client> {
  const signer = new EphemeralSigner(accountKey);
  const encryptionKey = new Uint8Array(32);
  crypto.getRandomValues(encryptionKey);

  return XMTPClient.create(signer, encryptionKey, {
    env: "dev",
  });
}
