"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import { IDENTITY_SYSTEM_ABI, IDENTITY_SYSTEM_ADDRESS } from "@/lib/contracts";
import type { WalletContext } from "@/lib/notifications";
import { useRootId, useWalletTokens } from "./useIdentityReads";

/**
 * The tokens a wallet holds and the tokens its identity currently attests,
 * which decide which logs notify it. `isReady` turns true once every read has
 * landed: a log is classified only once, so it must not run on partial sets.
 */
export function useNotificationContext(address: `0x${string}` | undefined) {
  const queryClient = useQueryClient();
  const wallet = address?.toLowerCase();

  const walletTokens = useWalletTokens(address);
  const root = useRootId(address);
  const rootId = root.data && root.data > 0n ? root.data : undefined;

  // Live attestations only: the contract leaves out revoked, expired and burned.
  const attested = useReadContract({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    functionName: "getAttestationsByAttester",
    args: rootId ? [rootId] : undefined,
    query: { enabled: !!rootId },
  });

  const context = useMemo<WalletContext>(
    () => ({
      wallet,
      rootId,
      myTokens: new Set((walletTokens.data ?? []).map(String)),
      attestedTokens: new Set((attested.data ?? []).map(String)),
    }),
    [wallet, rootId, walletTokens.data, attested.data]
  );

  const reads = [walletTokens, root, attested];
  const isReady =
    !wallet ||
    (walletTokens.isSuccess &&
      root.isSuccess &&
      (!rootId || attested.isSuccess));
  const isError = !!wallet && reads.some((read) => read.isError);

  /**
   * Re-reads everything after a log shows the wallet's tokens or attestations
   * changed. Invalidating skips disabled reads, such as attestations for a
   * wallet with no root identity.
   */
  const refresh = () => {
    for (const { queryKey } of reads) {
      queryClient.invalidateQueries({ queryKey });
    }
    queryClient.invalidateQueries({ queryKey: ["attesters-detailed"] });
  };

  return {
    context,
    walletTokenIds: walletTokens.data,
    isReady,
    isError,
    refresh,
  };
}
