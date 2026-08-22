"use client";
// app/providers.tsx

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/config";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Polyfill for BigInt serialization (prevents "Do not know how to serialize a
// BigInt" in React Query / Wagmi mutations). Defined rather than assigned so it
// stays non-enumerable, matching the native prototype methods -- a plain
// assignment would show up in `for...in` over a BigInt.
if (typeof BigInt !== "undefined" && !("toJSON" in BigInt.prototype)) {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function (this: bigint) {
      return this.toString();
    },
    writable: true,
    configurable: true,
  });
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#63fc9f",
            accentColorForeground: "black",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
