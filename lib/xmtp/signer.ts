import { getBytes } from "ethers";
import type { HDNodeWallet } from "ethers";

export function createEOASigner(wallet: HDNodeWallet) {
  return {
    getAddress: async () => wallet.address,
    getIdentifier: async () => ({
      identifier: wallet.address.toLowerCase(),
      identifierKind: "Ethereum" as const,
    }),
    signMessage: async (message: string) => {
      const signature = await wallet.signMessage(message);
      return getBytes(signature);
    },
  };
}

