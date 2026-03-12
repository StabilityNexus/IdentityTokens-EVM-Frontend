"use client";

import { useReadContract, useChainId } from "wagmi";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

export interface GivenEndorsement {
    toTokenId: bigint;
    endorsementIndex: bigint;
}

/**
 * Hook: read endorsements GIVEN BY a DIT token (reverse index).
 *
 * Satisfies DIT spec: "efficient to retrieve which identities have been
 * endorsed by a given identity".
 *
 * Each entry points back into the receiver's endorsement array at
 * `endorsementIndex`, so you can cross-reference with `useGetEndorsements`
 * for the full Endorsement struct.
 *
 * Usage:
 *   const { givenEndorsements } = useGetGivenEndorsements({ tokenId: 1n, start: 0n, end: 20n });
 */
export function useGetGivenEndorsements({
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
        functionName: "getGivenEndorsements",
        args: [tokenId!, start, end],
        query: { enabled: !!address && tokenId !== undefined },
    });

    return {
        givenEndorsements: (data as GivenEndorsement[] | undefined) ?? [],
        isLoading,
        error,
        refetch,
    } as const;
}

/**
 * Hook: total count of endorsements given by a token.
 * Use this to drive pagination for `useGetGivenEndorsements`.
 */
export function useGetGivenEndorsementCount(tokenId: bigint | undefined) {
    const chainId = useChainId();
    const address = getTNTAddress(chainId);

    const { data, isLoading, error } = useReadContract({
        address,
        abi: TNT_ABI,
        functionName: "getGivenEndorsementCount",
        args: [tokenId!],
        query: { enabled: !!address && tokenId !== undefined },
    });

    return { count: data as bigint | undefined, isLoading, error } as const;
}
