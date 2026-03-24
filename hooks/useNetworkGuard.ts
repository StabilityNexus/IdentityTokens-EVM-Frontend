"use client";

import type { Chain } from "viem";
import { useCallback } from "react";
import { useAccount, useChains, useSwitchChain } from "wagmi";

interface UseNetworkGuardResult {
  isWrongNetwork: boolean;
  isSwitchPending: boolean;
  targetChains: readonly Chain[];
  switchNetwork: (chainId: number) => Promise<void>;
  chainId: number | undefined;
}

function useNetworkGuard(): UseNetworkGuardResult {
  const { status, chainId } = useAccount();
  const targetChains = useChains();
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain();

  const isWrongNetwork =
    status === "connected" &&
    typeof chainId === "number" &&
    targetChains.length > 0 &&
    !targetChains.some((c) => c.id === chainId);

  const switchNetwork = useCallback(
    async (nextChainId: number): Promise<void> => {
      try {
        await switchChainAsync({ chainId: nextChainId });
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err?.code === 4001) {
          console.info("Chain switch rejected by user", { nextChainId });
        } else if (err?.code === 4902) {
          console.warn("Chain not added to wallet", { nextChainId });
        } else {
          console.error("Chain switch failed", err);
        }
      }
    },
    [switchChainAsync]
  );

  return {
    isWrongNetwork,
    isSwitchPending,
    targetChains,
    switchNetwork,
    chainId,
  };
}

export default useNetworkGuard;
