"use client";

import type { Chain } from "viem";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useChains, useSwitchChain } from "wagmi";

type Eip1193Provider = {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void
  ) => void;
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const parseChainId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) return undefined;
  const parsed = normalized.startsWith("0x")
    ? Number.parseInt(normalized, 16)
    : Number.parseInt(normalized, 10);
  return Number.isInteger(parsed) ? parsed : undefined;
};

interface UseNetworkGuardResult {
  isWrongNetwork: boolean;
  isSwitchPending: boolean;
  targetChains: readonly Chain[];
  switchNetwork: (chainId: number) => Promise<void>;
  chainId: number | undefined;
}

function useNetworkGuard(): UseNetworkGuardResult {
  const { status, chainId: accountChainId, connector } = useAccount();
  const storeChainId = useChainId();
  const targetChains = useChains();
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain();
  const [eventChain, setEventChain] = useState<
    { chainId: number; connectorId: string } | undefined
  >();

  // Wagmi is primary source-of-truth; use connector chainChanged only as fallback
  // when Wagmi chain is temporarily unavailable.
  const chainId = useMemo(() => {
    if (status !== "connected") return accountChainId;
    if (typeof accountChainId === "number") return accountChainId;
    if (typeof storeChainId === "number") return storeChainId;
    if (eventChain?.connectorId && eventChain.connectorId === connector?.id) {
      return eventChain.chainId;
    }
    return accountChainId;
  }, [status, storeChainId, accountChainId, eventChain, connector?.id]);

  const isWrongNetwork =
    status === "connected" &&
    typeof chainId === "number" &&
    targetChains.length > 0 &&
    !targetChains.some((c) => c.id === chainId);

  useEffect(() => {
    let provider: Eip1193Provider | undefined;
    let stale = false;

    const handleChainChanged = (next: unknown) => {
      const nextChainId = parseChainId(next);
      if (typeof nextChainId === "number" && connector?.id) {
        setEventChain({ chainId: nextChainId, connectorId: connector.id });
      }
    };

    const attach = async () => {
      try {
        const maybeProvider =
          typeof connector?.getProvider === "function"
            ? ((await connector.getProvider()) as Eip1193Provider | undefined)
            : undefined;
        if (stale) return;
        provider = maybeProvider;
        provider?.on?.("chainChanged", handleChainChanged);
      } catch {
        // ignore
      }
    };

    attach();
    return () => {
      stale = true;
      provider?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [status, connector]);

  const switchNetwork = useCallback(
    async (nextChainId: number): Promise<void> => {
      const targetChain = targetChains.find(
        (chain) => chain.id === nextChainId
      );
      const addEthereumChainParameter = targetChain
        ? {
            chainName: targetChain.name,
            nativeCurrency: targetChain.nativeCurrency,
            rpcUrls: targetChain.rpcUrls.default.http,
            blockExplorerUrls: targetChain.blockExplorers?.default?.url
              ? [targetChain.blockExplorers.default.url]
              : undefined,
          }
        : undefined;

      try {
        await switchChainAsync({
          chainId: nextChainId,
          connector: connector ?? undefined,
          addEthereumChainParameter,
        });
        // If the wallet does not emit chainChanged promptly, keep UI aligned with the request.
        if (connector?.id) {
          setEventChain({ chainId: nextChainId, connectorId: connector.id });
        }
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
    [switchChainAsync, connector, targetChains]
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
