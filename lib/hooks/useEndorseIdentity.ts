"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { type Hex } from "viem";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

/**
 * Hook: give an on-chain endorsement from one DIT token to another.
 *
 * Caller must own `fromId`. `toId` must not be compromised.
 * Pass `expiry = 0n` for a permanent endorsement.
 *
 * Usage:
 *   const { giveEndorsement, isPending } = useEndorseIdentity();
 *   giveEndorsement({ fromId: 1n, toId: 2n, connectionType: "colleague", expiry: 0n });
 */
export function useEndorseIdentity() {
    const chainId = useChainId();
    const address = getTNTAddress(chainId);

    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    function giveEndorsement({
        fromId,
        toId,
        connectionType,
        expiry = BigInt(0),
    }: {
        fromId: bigint;
        toId: bigint;
        /**
         * A plain string label (e.g. "colleague", "friend") that will be right-zero-
         * padded to bytes32, or a raw 0x-prefixed bytes32 hex string.
         */
        connectionType: string;
        expiry?: bigint;
    }) {
        if (!address) throw new Error(`TNT not deployed on chain ${chainId}`);

        const typeHash: Hex =
            connectionType.startsWith("0x") && connectionType.length === 66
                ? (connectionType as Hex)
                : ((() => {
                    const bytes = new TextEncoder().encode(connectionType);
                    const padded = new Uint8Array(32);
                    padded.set(bytes.slice(0, 32));
                    return ("0x" + [...padded].map((b) => b.toString(16).padStart(2, "0")).join("")) as Hex;
                })());

        writeContract({
            address,
            abi: TNT_ABI,
            functionName: "giveEndorsement",
            args: [fromId, toId, typeHash, expiry],
        });
    }

    return { giveEndorsement, hash, isPending: isPending || isConfirming, isSuccess, error } as const;
}
