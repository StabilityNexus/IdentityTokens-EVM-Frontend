import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  phantomWallet,
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { foundry, sepolia, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Decentralized Identity Token",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID", // Get one at https://cloud.reown.com/ (formerly WalletConnect)
  chains:
    process.env.NODE_ENV === "development"
      ? [foundry, sepolia, polygon]
      : [sepolia, polygon],
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
