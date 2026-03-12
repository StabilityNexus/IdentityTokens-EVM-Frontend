"use client";

import { useReadContract, useChainId } from "wagmi";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

export interface Endorsement {
    endorserTokenId: bigint;
    connectionType: `0x${string}`;
    timestamp: bigint;
    validUntil: bigint;
    revokedAt: bigint;
}

/**
 * Hook: read a paginated slice of endorsements RECEIVED by a DIT token.
 *
 * Returns all endorsements (including revoked ones — check `revokedAt !== 0n`).
 * For large tokens, paginate using `start`/`end`.
 *
 * Usage:
 *   const { endorsements, isLoading } = useGetEndorsements({ tokenId: 2n, start: 0n, end: 20n });
 */
export function useGetEndorsements({
    tokenId,
    start = BigInt(0),
    end = BigInt(20),
}: {
    tokenId: bigint | undefined;
    start?: bigint;
    end?: bigint;
}) {
    const chainId = useChainId();
    const address = getTNTAddress(chainId);

    const { data, isLoading, error, refetch } = useReadContract({
        address,
        abi: TNT_ABI,
        functionName: "getEndorsements",
        args: [tokenId!, start, end],
        query: { enabled: !!address && tokenId !== undefined },
    });

    return {
        endorsements: (data as Endorsement[] | undefined) ?? [],
        isLoading,
        error,
        refetch,
    } as const;
}

/**
 * Hook: read the total count of endorsements received by a token.
 * Use this to drive pagination for `useGetEndorsements`.
 */
export function useGetEndorsementCount(tokenId: bigint | undefined) {
    const chainId = useChainId();
    const address = getTNTAddress(chainId);

    const { data, isLoading, error } = useReadContract({
        address,
        abi: TNT_ABI,
        functionName: "getEndorsementCount",
        args: [tokenId!],
        query: { enabled: !!address && tokenId !== undefined },
    });

    return { count: data as bigint | undefined, isLoading, error } as const;
}
