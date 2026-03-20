import { createConfig, http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
} from "wagmi/chains";
import { injected, metaMask, coinbaseWallet, safe } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
  connectors: [
    injected({ target: "metaMask" }),
    injected({ target: "phantom" }),
    injected({ target: "trust" }),
    injected({ target: "coinbaseWallet" }),
    metaMask(),
    safe(),
    coinbaseWallet({ appName: "DIT" }),
  ],
  multiInjectedProviderDiscovery: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});
