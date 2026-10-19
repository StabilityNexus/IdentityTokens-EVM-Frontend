"use client";

import { useMemo } from "react";
import {
  useMultipleAttesters,
  useMultipleTokenDetails,
} from "./useIdentityReads";
import type { TokenTuple } from "./useWalletTokenList";
import { tokenTypeOf } from "@/lib/tokenId";
import { TOKEN_TYPE, TokenAttester } from "@/lib/types";
import { AttesterView } from "@/lib/types.responses";

/**
 * Every attestation on the given tokens, newest first, revoked and expired
 * included. ROOT can't be attested; PROFILE is skipped unless asked.
 */
export function useTokenAttesters(
  tokenIds: readonly bigint[] | undefined,
  { includeProfile }: { includeProfile: boolean }
) {
  // The same reads as useWalletTokenList, so the dashboard makes them once.
  const ids = tokenIds && tokenIds.length > 0 ? tokenIds : undefined;
  const details = useMultipleTokenDetails(ids);
  const pages = useMultipleAttesters(ids);

  const attesters = useMemo<TokenAttester[]>(() => {
    if (!ids || !pages.data) return [];

    return ids
      .flatMap((tokenId, i) => {
        const type = tokenTypeOf(tokenId);
        const listed =
          type === TOKEN_TYPE.SUB ||
          (includeProfile && type === TOKEN_TYPE.PROFILE);
        const result = pages.data[i];
        if (!listed || result?.status !== "success") return [];

        const [page] = result.result as readonly [
          readonly AttesterView[],
          bigint,
        ];
        const detail = details.data?.[i];
        const tokenName =
          detail?.status === "success" ? (detail.result as TokenTuple)[2] : "";
        return page.map((view) => ({ ...view, tokenId, tokenName }));
      })
      .sort((a, b) =>
        Number(b.attestation.timestamp - a.attestation.timestamp)
      );
  }, [ids, includeProfile, pages.data, details.data]);

  return {
    attesters,
    // Waiting on the wallet's token ids counts as loading too.
    isLoading: tokenIds === undefined || pages.isLoading || details.isLoading,
    isError: pages.isError,
    refetch: pages.refetch,
  };
}
