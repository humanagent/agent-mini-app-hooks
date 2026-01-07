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
  console.log(
    "[XMTP] [createXMTPClient] Starting client creation (isCreatingClient set to true)",
  );

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

    console.log("[XMTP] Creating client...");
    const identifier = signer.getIdentifier();
    const identifierValue =
      identifier instanceof Promise ? await identifier : identifier;
    console.log("[XMTP] Signer address:", identifierValue.identifier);
    console.log("[XMTP] Environment: production");
    console.log("[XMTP] Codecs count:", codecs.length);
    console.log(
      "[XMTP] Codec types:",
      codecs.map((c) => c.constructor.name),
    );

    console.log("[XMTP] Starting Client.create() call...");
    console.log(
      "[XMTP] Browser environment check:",
      typeof window !== "undefined",
    );
    console.log(
      "[XMTP] IndexedDB available:",
      typeof indexedDB !== "undefined",
    );

    const startTime = Date.now();
    console.log("[XMTP] Calling Client.create()...");
    console.log("[XMTP] Signer type:", typeof signer);

    const clientPromise = Client.create(signer, {
      env: "production",
      appVersion: "xmtp-agents/0",
      codecs,
    });

    console.log("[XMTP] Client.create() promise created, awaiting...");
    const client = await clientPromise;

    const duration = Date.now() - startTime;
    console.log(`[XMTP] Client.create() completed in ${duration}ms`);
    console.log("[XMTP] Client created successfully");
    console.log("[XMTP] Client inbox ID:", client.inboxId);
    console.log("[XMTP] Client installation ID:", client.installationId);
    console.log("[XMTP] Client type:", typeof client);
    console.log("[XMTP] Client constructor:", client.constructor.name);

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
