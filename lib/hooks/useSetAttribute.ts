"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { encodeAbiParameters, parseAbiParameters, type Hex } from "viem";
import TNT_ABI from "@/lib/abi/TNT.abi.json";
import { getTNTAddress } from "@/lib/contracts";

export type KnownAttributeKey =
  | "name"
  | "twitter"
  | "linkedin"
  | "github"
  | "nationality"
  | "residence"
  | "age_group";

/**
 * Returns the bytes32 key hash for a well-known attribute name.
 * Matches the pattern used on-chain: keccak256(abi.encodePacked(key)).
 */
export function attributeKeyHash(key: string): Hex {
  return encodeAbiParameters(parseAbiParameters("bytes32"), [
    // viem's keccak256 of an ABI-encoded string is not the same as solidity's keccak256(abi.encodePacked(key))
    // We use the raw bytes approach via TextEncoder to match Solidity's keccak256(bytes(key)).
    (() => {
      const bytes = new TextEncoder().encode(key);
      // Pad to 32 bytes (right-zero-padded, which is how bytes32 literals work in Solidity)
      const padded = new Uint8Array(32);
      padded.set(bytes.slice(0, 32));
      return ("0x" + [...padded].map((b) => b.toString(16).padStart(2, "0")).join("")) as Hex;
    })(),
  ]).slice(0, 66) as Hex; // keep only the bytes32 (66 hex chars incl. 0x)
}

/**
 * Hook: set a single utf-8 attribute on a DIT token.
 *
 * The on-chain key is bytes32 (a keccak256 hash). Pass either a raw bytes32 hex
 * string, or a plain string key (the hook will hash it for you).
 *
 * Usage:
 *   const { setAttribute, isPending } = useSetAttribute();
 *   setAttribute({ tokenId: 1n, key: "name", value: "Alice" });
 */
export function useSetAttribute() {
  const chainId = useChainId();
  const address = getTNTAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function setAttribute({
    tokenId,
    key,
    value,
  }: {
    tokenId: bigint;
    /** Either a plain string (will be keccak256'd) or a raw 0x-prefixed bytes32. */
    key: string;
    value: string;
  }) {
    if (!address) throw new Error(`TNT not deployed on chain ${chainId}`);

    const keyHash: Hex =
      key.startsWith("0x") && key.length === 66
        ? (key as Hex)
        : attributeKeyHash(key);

    const encoded = new TextEncoder().encode(value);

    writeContract({
      address,
      abi: TNT_ABI,
      functionName: "setAttribute",
      args: [tokenId, keyHash, encoded],
    });
  }

  return { setAttribute, hash, isPending: isPending || isConfirming, isSuccess, error } as const;
}
