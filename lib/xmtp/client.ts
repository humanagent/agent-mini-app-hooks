import { Client, type Signer } from "@xmtp/browser-sdk";
import { MarkdownCodec } from "@xmtp/content-type-markdown";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { ReplyCodec } from "@xmtp/content-type-reply";
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference";
import { WalletSendCallsCodec } from "@xmtp/content-type-wallet-send-calls";
import type { Hex } from "viem";
import { hexToBytes } from "viem";
import { createEphemeralSigner } from "./signer";

const dbEncryptionKey ="0xaccb9e4e9f5b9cd67cb572fcb682f53ec5eddae3ac1e65da4cf33316cf095f86"

export async function createXMTPClient(
  accountKey: Hex,
  options?: {
    env?: "production" | "dev" | "local";
    loggingLevel?: "off" | "error" | "warn" | "info" | "debug";
    dbEncryptionKey?: Uint8Array;
  },
) {
  try {
    const signer = createEphemeralSigner(accountKey);

    const codecs = [
      new ReactionCodec(),
      new ReplyCodec(),
      new RemoteAttachmentCodec(),
      new TransactionReferenceCodec(),
      new WalletSendCallsCodec(),
      new ReadReceiptCodec(),
      new MarkdownCodec(),
    ];

    const client = await Client.create(signer, {
      env: "production",
      appVersion: "xmtp-agents/0.1.0",
      dbEncryptionKey: hexToBytes(dbEncryptionKey),
      codecs,
    });

    return client;
  } catch (error) {
    console.error("[createXMTPClient] Error creating client:", error);
    throw error;
  }
}
