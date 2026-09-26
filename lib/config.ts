import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  phantomWallet,
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { foundry, sepolia, polygon } from "wagmi/chains";

// Keyed Sepolia RPC (e.g. Alchemy) when set; the public fallback rate-limits.
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || undefined;

export const config = getDefaultConfig({
  appName: "Decentralized Identity Token",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID", // Get one at https://cloud.reown.com/ (formerly WalletConnect)
  chains:
    process.env.NODE_ENV === "development"
      ? [foundry, sepolia, polygon]
      : [sepolia, polygon],
  transports: {
    [foundry.id]: http(),
    [sepolia.id]: http(sepoliaRpcUrl),
    [polygon.id]: http(),
  },
  wallets: [
    {
      groupName: "Popular",
      wallets: [
        phantomWallet,
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
        trustWallet,
      ],
    },
  ],
  ssr: true,
});
