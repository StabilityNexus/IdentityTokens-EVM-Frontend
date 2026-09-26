"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WalletMinimal } from "lucide-react";
import { getAddress, isAddress } from "viem";
import { useAccount } from "wagmi";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import { TokenList } from "@/components/dashboard/TokenList";
import { AttestersModal } from "@/components/attestations/AttestersModal";
import { useWalletIdentity } from "@/hooks/useWalletIdentity";
import { useWalletTokenList } from "@/hooks/useWalletTokenList";
import { getContractErrorMessage } from "@/lib/errors";
import { formatLastUpdated, truncateAddress } from "@/lib/helpers";
import { getRankFromAttesters, getTrustScore } from "@/lib/rank";

/** Centred message used by every state this page can land in but the main one. */
function WalletNotice({
  title,
  detail,
}: {
  title: string;
  detail?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <WalletMinimal size={24} className="text-gray-400" />
        </div>
        <h1 className="font-utsaha text-2xl text-white">{title}</h1>
        {detail && (
          <p className="mt-2 font-utsaha text-sm text-gray-400">{detail}</p>
        )}
      </div>
    </div>
  );
}

/**
 * A read-only dashboard for someone else's wallet, reached from an attesters
 * list. It deliberately shows only what is public on-chain -- the wallet's root
 * identity and the tokens it holds -- and never links on to that wallet's
 * profile page.
 *
 * Publicly this is `/<wallet_address>`; `NotFoundRedirect` re-points that here
 * because a static export has no way to pre-render a route per wallet.
 */
export default function WalletPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("u")?.trim() ?? "";

  // Matched leniently and then normalised: an address is case-insensitive on
  // chain, so a link that lost its checksum casing in transit must still
  // resolve. `getAddress` gives the contract reads one canonical spelling.
  const walletAddress = useMemo(
    () => (isAddress(query, { strict: false }) ? getAddress(query) : undefined),
    [query]
  );

  const {
    hasRootIdentity,
    displayName,
    rootCreatedAt,
    hasProfile,
    profileData,
    walletTokenIds,
    isLoading,
    error,
  } = useWalletIdentity(walletAddress);

  const {
    tokens,
    totalAttestations,
    attestationsExcludingProfile,
    latestCreatedAt,
  } = useWalletTokenList(walletTokenIds);

  // Share copy speaks in the first person only on the viewer's own wallet.
  const { address: connectedAddress } = useAccount();
  const isOwnWallet =
    !!walletAddress &&
    connectedAddress?.toLowerCase() === walletAddress.toLowerCase();

  const [attestersFor, setAttestersFor] = useState<{
    tokenId: bigint;
    name: string;
  } | null>(null);

  if (!query) {
    return (
      <WalletNotice
        title="No wallet specified"
        detail="Open a wallet by address, for example dit.stability.nexus/0x…"
      />
    );
  }

  if (!walletAddress) {
    return (
      <WalletNotice
        title="Invalid wallet address"
        detail={`“${query}” is not a valid Ethereum address.`}
      />
    );
  }

  if (error) {
    return (
      <WalletNotice
        title="Couldn’t load this wallet"
        detail={getContractErrorMessage(error)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-app-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-brand-green border-t-transparent motion-safe:animate-spin" />
          <p className="font-utsaha text-gray-400">Loading wallet…</p>
        </div>
      </div>
    );
  }

  if (!hasRootIdentity) {
    return (
      <WalletNotice
        title="No identity yet"
        detail={`${truncateAddress(walletAddress)} hasn’t created a root identity on DIT.`}
      />
    );
  }

  // The profile name is public on-chain, but this view is reached from an
  // attestation rather than from a profile, so the root display name -- the
  // name the wallet chose to attest under -- takes precedence.
  const name =
    displayName?.trim() ||
    profileData?.name?.trim() ||
    truncateAddress(walletAddress);

  const socialsCount = profileData
    ? [
        profileData.github,
        profileData.discord,
        profileData.xDotCom,
        profileData.email,
      ].filter(Boolean).length
    : 0;

  return (
    <div className="flex h-full flex-col gap-8 bg-app-bg pb-12">
      <DashboardMetrics
        name={name}
        walletAddress={walletAddress}
        attesters={attestationsExcludingProfile}
        lastUpdated={formatLastUpdated(rootCreatedAt, latestCreatedAt)}
        isOwn={isOwnWallet}
        trustScore={getTrustScore(totalAttestations, hasProfile ? 20 : 0)}
        trustFlags={totalAttestations > 0 ? "None" : "No attestations yet"}
        trustDescription="On-Chain Reputation"
        totalAttestations={totalAttestations}
        activeTokens={tokens.length}
        socials={socialsCount}
        badgeRank={getRankFromAttesters(totalAttestations)}
      />

      <div className="px-4 sm:px-6 md:pr-14 md:pl-10">
        <TokenList
          variant="tokens"
          title={`Tokens held by ${name}`}
          tokens={tokens}
          readOnly
          emptyMessage="This wallet holds no tokens yet."
          onViewAll={(id) =>
            setAttestersFor({
              tokenId: BigInt(id.replace(/^#/, "")),
              name: tokens.find((t) => t.tokenId === id)?.name || "",
            })
          }
        />
      </div>

      {attestersFor && (
        <AttestersModal
          isOpen
          onClose={() => setAttestersFor(null)}
          tokenId={attestersFor.tokenId}
          tokenName={attestersFor.name}
        />
      )}
    </div>
  );
}
