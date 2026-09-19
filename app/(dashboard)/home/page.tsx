"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Metrics from "@/components/dashboard/Metrics";
import { TokenList } from "@/components/dashboard/TokenList";
import { AttestersModal } from "@/components/attestations/AttestersModal";
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

  const [attestersFor, setAttestersFor] = useState<{
    tokenId: bigint;
    name: string;
  } | null>(null);

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

        // Skip only ROOT; PROFILE is listed with the other tokens.
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

  const { openConnectModal } = useConnectModal();

  if (!isConnected) {
    return (
      <main className="flex h-full items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="font-utsaha text-2xl text-white">
            Connect Your Wallet
          </h2>
          <p className="mt-2 font-utsaha text-sm text-gray-400 sm:text-base">
            Connect your wallet to view your identity tokens, attestations, and
            metrics
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openConnectModal?.()}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-brand-green px-6 py-2.5 font-utsaha text-base font-semibold text-dashboard-bg shadow-md transition-transform duration-200 ease-out hover:scale-[1.02] hover:bg-brand-green/90 active:scale-[0.98] sm:w-auto"
            >
              Connect Wallet
            </button>
            <Link
              href="/discover"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 font-utsaha text-base text-gray-300 transition-colors hover:bg-white/5 hover:text-white sm:w-auto"
            >
              Explore Discover
            </Link>
          </div>
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

      <TokenList
        variant="tokens"
        tokens={tokenListData}
        onViewAll={(id) =>
          setAttestersFor({
            tokenId: BigInt(id.replace(/^#/, "")),
            name: tokenListData.find((t) => t.tokenId === id)?.name || "",
          })
        }
      />

      {attestersFor && (
        <AttestersModal
          isOpen
          onClose={() => setAttestersFor(null)}
          tokenId={attestersFor.tokenId}
          tokenName={attestersFor.name}
        />
      )}
    </main>
  );
}
