import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  sepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Decentralized Identity Token",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID", // Get one at https://cloud.reown.com/ (formerly WalletConnect)
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
