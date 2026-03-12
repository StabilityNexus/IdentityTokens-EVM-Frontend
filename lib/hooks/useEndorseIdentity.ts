"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { type Hex } from "viem";
import CLIENT_ABI from "@/lib/abi/TNT.client.abi.json";
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

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

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

    let typeHash: Hex;
    if (connectionType.startsWith("0x") && connectionType.length === 66) {
      typeHash = connectionType as Hex;
    } else {
      const bytes = new TextEncoder().encode(connectionType);
      if (bytes.length > 32) {
        throw new Error(
          `connectionType "${connectionType}" encodes to ${bytes.length} bytes; max is 32 bytes`
        );
      }
      const padded = new Uint8Array(32);
      padded.set(bytes);
      typeHash = ("0x" +
        [...padded]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")) as Hex;
    }

    writeContract({
      address,
      abi: CLIENT_ABI,
      functionName: "giveEndorsement",
      args: [fromId, toId, typeHash, expiry],
    });
  }

  return {
    giveEndorsement,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error: error ?? receiptError,
  } as const;
}
