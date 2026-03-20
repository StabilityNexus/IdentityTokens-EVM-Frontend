export const WALLET_METADATA: Record<
  string,
  { label: string; icon: string; priority?: number }
> = {
  "io.metamask": {
    label: "MetaMask",
    icon: "/wallets/metamask.svg",
    priority: 10,
  },
  "com.coinbase.wallet": {
    label: "Coinbase Wallet",
    icon: "/wallets/cbw.svg",
    priority: 9,
  },
  "app.phantom": {
    label: "Phantom",
    icon: "/wallets/Phantom.svg",
    priority: 8,
  },
  "com.brave.wallet": {
    label: "Brave Wallet",
    icon: "/wallets/brave.svg",
    priority: 7,
  },
  "app.backpack": {
    label: "Backpack (EVM beta)",
    icon: "/wallets/backpack.png",
    priority: 6,
  },
  "io.xdefi": {
    label: "Ctrl Wallet",
    icon: "/wallets/ctrl.svg",
    priority: 5,
  },
  "io.rabby": {
    label: "Rabby Wallet",
    icon: "/wallets/rabby.svg",
    priority: 4,
  },
};
