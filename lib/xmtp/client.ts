import { Client, type ExtractCodecContentTypes } from "@xmtp/browser-sdk";
import { MarkdownCodec } from "@xmtp/content-type-markdown";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { ReplyCodec } from "@xmtp/content-type-reply";
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference";
import { WalletSendCallsCodec } from "@xmtp/content-type-wallet-send-calls";
import { createEphemeralSigner, type PrivateKey } from "./signer";

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

export async function createXMTPClient(
  privateKey: PrivateKey,
): Promise<Client<ContentTypes>> {
  console.log("[createXMTPClient] Starting client creation...");
  
  if (typeof window === "undefined") {
    throw new Error("XMTP client can only be created in browser environment");
  }

  console.log("[createXMTPClient] Creating ephemeral signer...");
  const signer = createEphemeralSigner(privateKey);
  const identifier = signer.getIdentifier();
  console.log("[createXMTPClient] Signer created for address:", identifier.identifier);

  console.log("[createXMTPClient] Initializing codecs...");
  const codecs = [
    new ReactionCodec(),
    new ReplyCodec(),
    new RemoteAttachmentCodec(),
    new TransactionReferenceCodec(),
    new WalletSendCallsCodec(),
    new ReadReceiptCodec(),
    new MarkdownCodec(),
  ];
  console.log("[createXMTPClient] Codecs initialized:", codecs.length, "codecs");

  console.log("[createXMTPClient] Calling Client.create with env: production");
  const client = await Client.create(signer, {
    env: "production",
    loggingLevel: "warn",
    appVersion: "xmtp-agents/0",
    codecs,
  });

  console.log("[createXMTPClient] Client.create completed");
  console.log("[createXMTPClient] Client inboxId:", client.inboxId);
  console.log("[createXMTPClient] Client installationId:", client.installationId);

  return client;
}
