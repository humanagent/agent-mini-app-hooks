import {
  Client,
  type ClientOptions,
  type ExtractCodecContentTypes,
  type Signer,
} from "@xmtp/browser-sdk";
import { MarkdownCodec } from "@xmtp/content-type-markdown";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { ReplyCodec } from "@xmtp/content-type-reply";
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference";
import { WalletSendCallsCodec } from "@xmtp/content-type-wallet-send-calls";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getOrCreateEphemeralAccountKey } from "@/lib/xmtp/signer";
import { createEphemeralSigner } from "@/lib/xmtp/signer";
import { hexToBytes } from "viem";

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

export type InitializeClientOptions = {
  dbEncryptionKey?: Uint8Array;
  env?: ClientOptions["env"];
  loggingLevel?: ClientOptions["loggingLevel"];
  signer: Signer;
};

export type XMTPContextValue = {
  client?: Client<ContentTypes>;
  setClient: React.Dispatch<
    React.SetStateAction<Client<ContentTypes> | undefined>
  >;
  initialize: (
    options: InitializeClientOptions,
  ) => Promise<Client<ContentTypes> | undefined>;
  initializing: boolean;
  error: Error | null;
  disconnect: () => void;
};

const XMTPContext = createContext<XMTPContextValue>({
  setClient: () => {},
  initialize: () => Promise.reject(new Error("XMTPProvider not available")),
  initializing: false,
  error: null,
  disconnect: () => {},
});

export type XMTPProviderProps = React.PropsWithChildren & {
  client?: Client<ContentTypes>;
};

const dbEncryptionKey =
  "0xaccb9e4e9f5b9cd67cb572fcb682f53ec5eddae3ac1e65da4cf33316cf095f86";

export function XMTPClientProvider({
  children,
  client: initialClient,
}: XMTPProviderProps) {
  const [client, setClient] = useState<Client<ContentTypes> | undefined>(
    initialClient,
  );

  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initializingRef = useRef(false);

  const initialize = useCallback(
    async ({
      dbEncryptionKey: customDbEncryptionKey,
      env,
      loggingLevel,
      signer,
    }: InitializeClientOptions) => {
      if (!client) {
        if (initializingRef.current) {
          return undefined;
        }

        initializingRef.current = true;

        setError(null);
        setInitializing(true);

        let xmtpClient: Client<ContentTypes>;

        try {
          xmtpClient = await Client.create(signer, {
            env,
            loggingLevel,
            dbEncryptionKey:
              customDbEncryptionKey || hexToBytes(dbEncryptionKey),
            appVersion: "xmtp-agents/0.1.0",
            codecs: [
              new ReactionCodec(),
              new ReplyCodec(),
              new RemoteAttachmentCodec(),
              new TransactionReferenceCodec(),
              new WalletSendCallsCodec(),
              new ReadReceiptCodec(),
              new MarkdownCodec(),
            ],
          });
          setClient(xmtpClient);
        } catch (e) {
          setClient(undefined);
          setError(e as Error);
          throw e;
        } finally {
          initializingRef.current = false;
          setInitializing(false);
        }

        return xmtpClient;
      }
      return client;
    },
    [client],
  );

  const disconnect = useCallback(() => {
    if (client) {
      client.close();
      setClient(undefined);
    }
  }, [client]);

  // Auto-initialize with ephemeral account
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!client && !initializing && !initializingRef.current) {
      const accountKey = getOrCreateEphemeralAccountKey();
      const signer = createEphemeralSigner(accountKey);
      void initialize({
        env: "production",
        signer,
      });
    }
  }, [client, initialize, initializing]);

  const value = useMemo(
    () => ({
      client,
      setClient,
      initialize,
      initializing,
      error,
      disconnect,
    }),
    [client, initialize, initializing, error, disconnect],
  );

  return <XMTPContext.Provider value={value}>{children}</XMTPContext.Provider>;
}

export function useXMTPClient() {
  return useContext(XMTPContext);
}