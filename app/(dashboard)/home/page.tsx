"use client";

import React, { useMemo } from "react";
import Metrics from "@/components/dashboard/Metrics";
import { TokenList } from "@/components/dashboard/TokenList";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import {
  useMultipleTokenDetails,
  useMultipleTokenTypes,
  useMultipleEndorsementCounts,
} from "@/hooks/useIdentityReads";
import { formatExpiry } from "@/lib/helpers";
import { TOKEN_TYPE } from "@/lib/types";

export default function Home() {
  const { isConnected, walletTokenIds, hasProfile, profileData, isLoading } =
    useIdentityGate();

  // Batch-fetch token details, types, and endorsement counts
  const { data: tokenDetails } = useMultipleTokenDetails(
    walletTokenIds.length > 0 ? walletTokenIds : undefined
  );
  const { data: tokenTypes } = useMultipleTokenTypes(
    walletTokenIds.length > 0 ? walletTokenIds : undefined
  );
  const { data: endorsementCounts } = useMultipleEndorsementCounts(
    walletTokenIds.length > 0 ? walletTokenIds : undefined
  );

  // Build tokens for display (excludes the ROOT token)
  const tokenListData = useMemo(() => {
    if (!walletTokenIds || walletTokenIds.length === 0) return [];

    return walletTokenIds
      .map((id, i) => {
        const detail = tokenDetails?.[i];
        const typeResult = tokenTypes?.[i];
        const endorseResult = endorsementCounts?.[i];

        // Skip only ROOT, the wallet's identity anchor. The PROFILE token is
        // meant to be listed alongside the user's other tokens.
        const tokenType =
          typeResult?.status === "success" ? (typeResult.result as number) : -1;
        if (tokenType === TOKEN_TYPE.ROOT) return null;

        const token = detail?.status === "success" ? detail.result : undefined;
        const endorseCount =
          endorseResult?.status === "success"
            ? Number(endorseResult.result)
            : 0;

        const tokenTuple = token as
          | readonly [
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
            ]
          | undefined;

        return {
          tokenId: `#${id.toString()}`,
          name: tokenTuple ? tokenTuple[2] || "Unnamed" : "Loading…",
          type: tokenTuple ? tokenTuple[3] || "Unknown" : "…",
          expiresIn: tokenTuple ? formatExpiry(tokenTuple[6]) : "…",
          endorsements: endorseCount,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [walletTokenIds, tokenDetails, tokenTypes, endorsementCounts]);

  // Calculate real metrics
  const totalEndorsements = useMemo(() => {
    if (!endorsementCounts) return 0;
    return endorsementCounts.reduce((sum, r) => {
      if (r?.status === "success") return sum + Number(r.result);
      return sum;
    }, 0);
  }, [endorsementCounts]);

  const socialsCount = profileData
    ? [
        profileData.github,
        profileData.discord,
        profileData.xDotCom,
        profileData.email,
      ].filter(Boolean).length
    : 0;

  if (!isConnected) {
    return (
      <main className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="font-utsaha text-2xl text-white">
            Connect Your Wallet
          </h2>
          <p className="mt-2 font-utsaha text-gray-400">
            Connect your wallet to see your tokens
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-gray-400">Loading tokens…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 px-4 pt-9 pb-12 sm:px-6 md:pr-14 md:pl-10">
      <Metrics
        totalEndorsements={totalEndorsements}
        activeTokens={tokenListData.length}
        socials={socialsCount}
        badgesEarned={hasProfile ? "Profile Created" : "No badges yet"}
      />

      <TokenList variant="tokens" tokens={tokenListData} />
    </main>
  );
}
