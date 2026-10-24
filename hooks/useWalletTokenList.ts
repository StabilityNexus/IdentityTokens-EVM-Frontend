"use client";

import { useMemo } from "react";
import {
  useMultipleAttesters,
  useMultipleTokenDetails,
} from "./useIdentityReads";
import { attestationStatus, formatExpiry } from "@/lib/helpers";
import { formatTokenId, tokenTypeOf } from "@/lib/tokenId";
import { TOKEN_TYPE, UITokenData } from "@/lib/types";

/**
 * The `tokens` mapping getter returns a flat tuple rather than a named struct.
 * Only four positions are read here: 2 = tokenName, 3 = tokenType,
 * 6 = validUntil, 7 = createdAt.
 */
export type TokenTuple = readonly [
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
 * Turn a wallet's token ids into rows a `TokenList` can render, in two
 * multicalls rather than two reads per token.
 */
export function useWalletTokenList(tokenIds: readonly bigint[]) {
  const ids = tokenIds.length > 0 ? tokenIds : undefined;

  const { data: tokenDetails } = useMultipleTokenDetails(ids);
  // The same read "Who attested" lists, so a dashboard makes it once.
  const { data: attesterPages } = useMultipleAttesters(ids);

  /** Active attestations on each token, in `ids` order. */
  const activeCounts = useMemo(
    () =>
      (ids ?? []).map(
        (_, i) =>
          (attesterPages?.[i] ?? []).filter(
            (view) => attestationStatus(view.attestation) === "active"
          ).length
      ),
    [ids, attesterPages]
  );

  const tokens = useMemo<UITokenData[]>(() => {
    if (!ids) return [];

    return ids
      .map((id, i): UITokenData | null => {
        // Skip only ROOT, the wallet's identity anchor. The PROFILE token is
        // meant to be listed alongside the wallet's other tokens.
        if (tokenTypeOf(id) === TOKEN_TYPE.ROOT) return null;

        const detail = tokenDetails?.[i];
        const token =
          detail?.status === "success"
            ? (detail.result as TokenTuple)
            : undefined;

        return {
          tokenId: formatTokenId(id),
          name: token ? token[2] || "Unnamed" : "Loading…",
          type: token ? token[3] || "Unknown" : "…",
          expiresIn: token ? formatExpiry(token[6]) : "…",
          attestations: activeCounts[i],
        };
      })
      .filter((t): t is UITokenData => t !== null);
  }, [ids, tokenDetails, activeCounts]);

  /** Attestations across every token the wallet holds, ROOT included. */
  const totalAttestations = activeCounts.reduce((sum, n) => sum + n, 0);

  /** When the newest of these tokens was minted, or null before any load. */
  const latestCreatedAt = useMemo(() => {
    if (!tokenDetails) return null;
    return tokenDetails.reduce<bigint | null>((latest, detail) => {
      if (detail?.status !== "success") return latest;
      const createdAt = (detail.result as TokenTuple)[7];
      return latest === null || createdAt > latest ? createdAt : latest;
    }, null);
  }, [tokenDetails]);

  /** Tokens minted with the Socials token type. */
  const socialTokens = tokens.filter(
    (t) => t.type.trim().toLowerCase() === "socials"
  ).length;

  return {
    tokens,
    socialTokens,
    totalAttestations,
    latestCreatedAt,
  };
}
