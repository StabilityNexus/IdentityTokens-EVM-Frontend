"use client";

import type { Chain } from "viem";
import { useCallback } from "react";
import { useAccount, useChains, useSwitchChain } from "wagmi";

interface UseNetworkGuardResult {
  isWrongNetwork: boolean;
  isSwitchPending: boolean;
  targetChains: readonly Chain[];
  switchNetwork: (chainId: number) => void;
}

function useNetworkGuard(): UseNetworkGuardResult {
  const { status, chainId } = useAccount();
  const targetChains = useChains();
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain();

  const isWrongNetwork =
    status === "connected" &&
    typeof chainId === "number" &&
    targetChains.length > 0 &&
    !isSwitchPending &&
    !targetChains.some((chain) => chain.id === chainId);

  const switchNetwork = useCallback(
    (nextChainId: number) => {
      void switchChainAsync({ chainId: nextChainId }).catch(
        (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown chain switch error";
          console.warn("Chain switch rejected:", message);
        }
      );
    },
    [switchChainAsync]
  );

  return {
    isWrongNetwork,
    isSwitchPending,
    targetChains,
    switchNetwork,
  };
}

export default useNetworkGuard;
