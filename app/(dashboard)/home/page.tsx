"use client";

import React, { useMemo } from "react";
import Metrics from "@/components/dashboard/Metrics";
import { TokenList } from "@/components/dashboard/TokenList";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import {
  useMultipleTokenDetails,
  useMultipleTokenTypes,
  useMultipleAttestationCounts,
} from "@/hooks/useIdentityReads";
import { getContractErrorMessage } from "@/lib/errors";
import { formatExpiry } from "@/lib/helpers";
import { TOKEN_TYPE } from "@/lib/types";

export default function Home() {
  const {
    isConnected,
    walletTokenIds,
    hasProfile,
    profileData,
    isLoading,
    error,
  } = useIdentityGate();

  // Batch-fetch token details, types, and attestation counts
  const { data: tokenDetails } = useMultipleTokenDetails(
    walletTokenIds.length > 0 ? walletTokenIds : undefined
  );
  const { data: tokenTypes } = useMultipleTokenTypes(
    walletTokenIds.length > 0 ? walletTokenIds : undefined
  );
  const { data: attestationCounts } = useMultipleAttestationCounts(
    walletTokenIds.length > 0 ? walletTokenIds : undefined
  );

  // Build tokens for display (excludes the ROOT token)
  const tokenListData = useMemo(() => {
    if (!walletTokenIds || walletTokenIds.length === 0) return [];

    return walletTokenIds
      .map((id, i) => {
        const detail = tokenDetails?.[i];
        const typeResult = tokenTypes?.[i];
        const attestResult = attestationCounts?.[i];

        // Skip only ROOT, the wallet's identity anchor. The PROFILE token is
        // meant to be listed alongside the user's other tokens.
        const tokenType =
          typeResult?.status === "success" ? (typeResult.result as number) : -1;
        if (tokenType === TOKEN_TYPE.ROOT) return null;

        const token = detail?.status === "success" ? detail.result : undefined;
        const attestCount =
          attestResult?.status === "success" ? Number(attestResult.result) : 0;

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
          attestations: attestCount,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [walletTokenIds, tokenDetails, tokenTypes, attestationCounts]);

  // Calculate real metrics
  const totalAttestations = useMemo(() => {
    if (!attestationCounts) return 0;
    return attestationCounts.reduce((sum, r) => {
      if (r?.status === "success") return sum + Number(r.result);
      return sum;
    }, 0);
  }, [attestationCounts]);

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

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-app-bg px-4">
        <div className="max-w-md text-center">
          <p className="font-utsaha text-lg text-white">
            Couldn&rsquo;t load your identity
          </p>
          <p className="mt-2 font-utsaha text-sm text-gray-400">
            {getContractErrorMessage(error)}
          </p>
          <p className="mt-3 font-utsaha text-xs text-gray-500">
            If this persists, the deployed contracts may not match this build.
            Check that your wallet is on the Sepolia network.
          </p>
        </div>
      </div>
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
        totalAttestations={totalAttestations}
        activeTokens={tokenListData.length}
        socials={socialsCount}
        badgesEarned={hasProfile ? "Profile Created" : "No badges yet"}
      />

      <TokenList variant="tokens" tokens={tokenListData} />
    </main>
  );
}
