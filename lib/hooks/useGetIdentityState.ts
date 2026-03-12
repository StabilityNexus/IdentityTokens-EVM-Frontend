"use client";

import { useReadContract, useChainId } from "wagmi";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

export interface IdentityState {
    isCompromised: boolean;
    backupWallet: `0x${string}`;
    pendingBackupWallet: `0x${string}`;
    backupUnlockTime: bigint;
}

/**
 * Hook: read the full identity state of a DIT token.
 *
 * Includes compromise status, current backup wallet, and pending timelock state.
 *
 * Usage:
 *   const { state, isLoading } = useGetIdentityState(1n);
 *   if (state?.isCompromised) { ... }
 */
export function useGetIdentityState(tokenId: bigint | undefined) {
    const chainId = useChainId();
    const address = getTNTAddress(chainId);

    const { data, isLoading, error, refetch } = useReadContract({
        address,
        abi: TNT_ABI,
        functionName: "getIdentityState",
        args: [tokenId!],
        query: { enabled: !!address && tokenId !== undefined },
    });

    return {
        state: data as IdentityState | undefined,
        isLoading,
        error,
        refetch,
    } as const;
}
