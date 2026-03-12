"use client";

import { useReadContract, useChainId } from "wagmi";
import { type Hex } from "viem";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

/**
 * Hook: read a single attribute from a DIT token and decode it as UTF-8 text.
 *
 * Pass `key` as a plain string (e.g. "name", "twitter") — the hook hashes it
 * the same way `useSetAttribute` does.
 *
 * Usage:
 *   const { value } = useGetAttribute({ tokenId: 1n, key: "name" });
 *   // value === "Alice"
 */
export function useGetAttribute({
    tokenId,
    key,
}: {
    tokenId: bigint | undefined;
    key: string;
}) {
    const chainId = useChainId();
    const address = getTNTAddress(chainId);

    const keyHash: Hex = (() => {
        if (key.startsWith("0x") && key.length === 66) return key as Hex;
        const bytes = new TextEncoder().encode(key);
        const padded = new Uint8Array(32);
        padded.set(bytes.slice(0, 32));
        return ("0x" + [...padded].map((b) => b.toString(16).padStart(2, "0")).join("")) as Hex;
    })();

    const { data, isLoading, error, refetch } = useReadContract({
        address,
        abi: TNT_ABI,
        functionName: "getAttribute",
        args: [tokenId!, keyHash],
        query: { enabled: !!address && tokenId !== undefined && !!key },
    });

    // data is raw bytes from the contract; decode as UTF-8 string
    const value =
        data && (data as `0x${string}`).length > 2
            ? new TextDecoder().decode(
                Uint8Array.from(
                    Buffer.from((data as string).slice(2), "hex"),
                ),
            )
            : undefined;

    return { value, raw: data as `0x${string}` | undefined, isLoading, error, refetch } as const;
}
