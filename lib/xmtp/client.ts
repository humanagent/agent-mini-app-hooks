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
  if (typeof window === "undefined") {
    throw new Error("XMTP client can only be created in browser environment");
  }

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

  console.log("[XMTP] Creating client...");
  console.log("[XMTP] Signer address:", signer.getIdentifier().identifier);
  console.log("[XMTP] Environment: production");
  console.log("[XMTP] Codecs:", codecs.map((c) => c.contentType.definition));

  const client = await Client.create(signer, {
    env: "production",
    loggingLevel: "debug",
    appVersion: "xmtp-agents/0",
    codecs,
  });

  console.log("[XMTP] Client created successfully");
  console.log("[XMTP] Client inbox ID:", client.inboxId);
  console.log("[XMTP] Client installation ID:", client.installationId);

  return client;
}
