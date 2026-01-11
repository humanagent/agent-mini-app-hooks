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
    console.log(`[XMTP] Client created in ${duration}ms (inbox: ${client.inboxId.slice(0, 8)}...)`);

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
