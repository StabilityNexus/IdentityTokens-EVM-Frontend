"use client";

import { useMemo } from "react";
import {
  useMultipleAttestationCounts,
  useMultipleTokenDetails,
  useMultipleTokenTypes,
} from "./useIdentityReads";
import { formatExpiry } from "@/lib/helpers";
import { TOKEN_TYPE, UITokenData } from "@/lib/types";

/**
 * The `tokens` mapping getter returns a flat tuple rather than a named struct.
 * Only four positions are read here: 2 = tokenName, 3 = tokenType,
 * 6 = validUntil, 7 = createdAt.
 */
type TokenTuple = readonly [
  bigint,
  bigint,
  string,
  string,
  `0x${string}`,
  string,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
  bigint,
  bigint,
];

/**
 * Turn a wallet's token ids into rows a `TokenList` can render, in three
 * multicalls rather than three reads per token.
 */
export function useWalletTokenList(tokenIds: readonly bigint[]) {
  const ids = tokenIds.length > 0 ? tokenIds : undefined;

  const { data: tokenDetails } = useMultipleTokenDetails(ids);
  const { data: tokenTypes } = useMultipleTokenTypes(ids);
  const { data: attestationCounts } = useMultipleAttestationCounts(ids);

  const tokens = useMemo<UITokenData[]>(() => {
    if (!ids) return [];

    return ids
      .map((id, i): UITokenData | null => {
        const typeResult = tokenTypes?.[i];
        const tokenType =
          typeResult?.status === "success" ? (typeResult.result as number) : -1;

        // Skip only ROOT, the wallet's identity anchor. The PROFILE token is
        // meant to be listed alongside the wallet's other tokens.
        if (tokenType === TOKEN_TYPE.ROOT) return null;

        const detail = tokenDetails?.[i];
        const token =
          detail?.status === "success"
            ? (detail.result as TokenTuple)
            : undefined;

        const attestResult = attestationCounts?.[i];

        return {
          tokenId: `#${id.toString()}`,
          name: token ? token[2] || "Unnamed" : "Loading…",
          type: token ? token[3] || "Unknown" : "…",
          expiresIn: token ? formatExpiry(token[6]) : "…",
          attestations:
            attestResult?.status === "success"
              ? Number(attestResult.result)
              : 0,
        };
      })
      .filter((t): t is UITokenData => t !== null);
  }, [ids, tokenDetails, tokenTypes, attestationCounts]);

  /** Attestations across every token the wallet holds, ROOT included. */
  const totalAttestations = useMemo(() => {
    if (!attestationCounts) return 0;
    return attestationCounts.reduce(
      (sum, r) => (r?.status === "success" ? sum + Number(r.result) : sum),
      0
    );
  }, [attestationCounts]);

  /** When the newest of these tokens was minted, or null before any load. */
  const latestCreatedAt = useMemo(() => {
    if (!tokenDetails) return null;
    return tokenDetails.reduce<bigint | null>((latest, detail) => {
      if (detail?.status !== "success") return latest;
      const createdAt = (detail.result as TokenTuple)[7];
      return latest === null || createdAt > latest ? createdAt : latest;
    }, null);
  }, [tokenDetails]);

  /** Attestations on every token except the PROFILE one, as the ID card shows. */
  const attestationsExcludingProfile = useMemo(() => {
    if (!attestationCounts) return 0;
    return attestationCounts.reduce((sum, r, i) => {
      if (r?.status !== "success") return sum;
      const typeResult = tokenTypes?.[i];
      // Until the types load, a token cannot be told apart from a profile.
      if (typeResult?.status !== "success") return sum;
      if (typeResult.result === TOKEN_TYPE.PROFILE) return sum;
      return sum + Number(r.result);
    }, 0);
  }, [attestationCounts, tokenTypes]);

  return {
    tokens,
    totalAttestations,
    attestationsExcludingProfile,
    latestCreatedAt,
  };
}
