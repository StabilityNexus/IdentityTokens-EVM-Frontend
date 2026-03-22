import { createConfig, http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
} from "wagmi/chains";
import { injected, safe } from "wagmi/connectors";

const getRpcUrl = (envVar: string) => {
  const url = process.env[envVar];
  if (!url) {
    throw new Error(`Missing expected env var: ${envVar}`);
  }
  return url;
};

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
  connectors: [
    // Discover installed browser extension wallets dynamically.
    injected(),
    safe(),
  ],
  multiInjectedProviderDiscovery: true,
  transports: {
    [mainnet.id]: http(getRpcUrl("NEXT_PUBLIC_MAINNET_RPC_URL")),
    [sepolia.id]: http(getRpcUrl("NEXT_PUBLIC_SEPOLIA_RPC_URL")),
    [polygon.id]: http(getRpcUrl("NEXT_PUBLIC_POLYGON_RPC_URL")),
    [optimism.id]: http(getRpcUrl("NEXT_PUBLIC_OPTIMISM_RPC_URL")),
    [arbitrum.id]: http(getRpcUrl("NEXT_PUBLIC_ARBITRUM_RPC_URL")),
    [base.id]: http(getRpcUrl("NEXT_PUBLIC_BASE_RPC_URL")),
  },
  ssr: true,
});
