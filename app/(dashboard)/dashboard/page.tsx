"use client";

import React, { useMemo } from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import { TokenList } from "@/components/dashboard/TokenList";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import {
  useMultipleTokenDetails,
  useMultipleTokenTypes,
  useMultipleAttestationCounts,
} from "@/hooks/useIdentityReads";
import { getContractErrorMessage } from "@/lib/errors";
import { formatExpiry, truncateAddress } from "@/lib/helpers";
import { getTrustScore } from "@/lib/rank";
import { TOKEN_TYPE } from "@/lib/types";

const DashboardPage = () => {
  const {
    isConnected,
    hasProfile,
    profileData,
    walletTokenIds,
    isLoading,
    error,
    address,
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

  // Build token list from on-chain data, excluding the ROOT token
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

        return {
          tokenId: `#${id.toString()}`,
          name: token
            ? (
                token as readonly [
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
              )[2] || "Unnamed"
            : "Loading…",
          type: token
            ? (
                token as readonly [
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
              )[3] || "Unknown"
            : "…",
          expiresIn: token
            ? formatExpiry(
                (
                  token as readonly [
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
                )[6]
              )
            : "…",
          attestations: attestCount,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [walletTokenIds, tokenDetails, tokenTypes, attestationCounts]);

  // Calculate real metrics from on-chain data
  const totalAttestations = useMemo(() => {
    if (!attestationCounts) return 0;
    return attestationCounts.reduce((sum, r) => {
      if (r?.status === "success") return sum + Number(r.result);
      return sum;
    }, 0);
  }, [attestationCounts]);

  const name =
    profileData?.name || (address ? truncateAddress(address) : "Anonymous");
  const nationality = profileData?.nationality || "";
  const walletAddress = address || "0x0000000000000000000000000000000000000000";

  const socialsCount = profileData
    ? [
        profileData.github,
        profileData.discord,
        profileData.xDotCom,
        profileData.email,
      ].filter(Boolean).length
    : 0;

  // The profile baseline is only earned here once a profile exists.
  const trustScore = getTrustScore(totalAttestations, hasProfile ? 20 : 0);

  if (!isConnected) {
    return (
      <div className="flex h-full items-center justify-center bg-app-bg">
        <div className="text-center">
          <h2 className="font-utsaha text-2xl text-white">
            Connect Your Wallet
          </h2>
          <p className="mt-2 font-utsaha text-gray-400">
            Connect your wallet to view your dashboard
          </p>
        </div>
      </div>
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
      <div className="flex h-full items-center justify-center bg-app-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-gray-400">Loading your identity…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-8 bg-app-bg pb-12">
      <DashboardMetrics
        name={profileData?.name || name}
        nationality={nationality}
        walletAddress={walletAddress as string}
        attesters={totalAttestations}
        lastUpdated="Just now"
        trustScore={trustScore}
        trustFlags={totalAttestations > 0 ? "None" : "No attestations yet"}
        trustDescription="On-Chain Reputation"
        totalAttestations={totalAttestations}
        activeTokens={tokenListData.length}
        socials={socialsCount}
        badgesEarned="Profile Active"
      />

      <div className="px-4 sm:px-6 md:pr-14 md:pl-10">
        {!hasProfile && (
          <div className="mb-6 rounded-2xl border border-brand-green/20 bg-brand-green/5 p-6 text-center">
            <h3 className="font-utsaha text-xl text-white">
              Welcome! Create your profile to get started
            </h3>
            <p className="mt-2 font-utsaha text-sm text-gray-400">
              Click &ldquo;Create Profile&rdquo; in the top bar to set up your
              on-chain identity
            </p>
          </div>
        )}

        <TokenList variant="tokens" tokens={tokenListData} />
      </div>
    </div>
  );
};

export default DashboardPage;
