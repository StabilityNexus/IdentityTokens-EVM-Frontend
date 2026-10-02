"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserX } from "lucide-react";
import {
  useActiveAttestationCount,
  useHasAttested,
  useProfile,
  useProfileLinks,
  useResolveUsername,
  useTokenOwner,
} from "@/hooks/useIdentityReads";
import { useRevokeAttestation } from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { AttestModal } from "@/components/forms/AttestModal";
import { CreateProfileModal } from "@/components/forms/CreateProfileModal";
import { AttestersModal } from "@/components/attestations/AttestersModal";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfileReputation } from "@/components/profile/ProfileReputation";
import { ProfileLinks } from "@/components/profile/ProfileLinks";
import { ProfileIdentity } from "@/components/profile/ProfileIdentity";
import { linksFromChain } from "@/lib/profileData";
import { parseTokenId, tokenTypeOf } from "@/lib/tokenId";
import { getRankFromAttesters, getTrustScore } from "@/lib/rank";
import { TOKEN_TYPE, TxStatus } from "@/lib/types";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const username = searchParams?.get("u") ?? "";

  const { isConnected, address, rootId } = useIdentityGate();

  // "pf-…" is a profile id; anything else is looked up as a username. Usernames
  // can't contain "-", so the two never clash.
  const parsedTokenId = parseTokenId(username);
  const idTokenId =
    parsedTokenId !== undefined &&
    tokenTypeOf(parsedTokenId) === TOKEN_TYPE.PROFILE
      ? parsedTokenId
      : undefined;

  const { data: resolvedTokenId, isFetching: isResolvingUsername } =
    useResolveUsername(username);

  const profileTokenId =
    idTokenId ??
    (resolvedTokenId && resolvedTokenId > 0n ? resolvedTokenId : undefined);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useProfile(profileTokenId);
  const { data: profileLinks, refetch: refetchLinks } =
    useProfileLinks(profileTokenId);
  const { data: ownerAddress } = useTokenOwner(profileTokenId);

  const { data: attestationCount, refetch: refetchAttestations } =
    useActiveAttestationCount(profileTokenId);

  const { data: viewerHasAttested, refetch: refetchHasAttested } =
    useHasAttested(rootId && rootId > 0n ? rootId : undefined, profileTokenId);

  const revokeAttestation = useRevokeAttestation();

  const [isAttestModalOpen, setIsAttestModalOpen] = useState(false);
  const [isAttestersModalOpen, setIsAttestersModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const totalAttestations = Number(attestationCount ?? 0n);
  const rank = getRankFromAttesters(totalAttestations);
  const trustScore = getTrustScore(totalAttestations);

  const customLinks = useMemo(
    () => linksFromChain(profileLinks ?? []),
    [profileLinks]
  );

  const isOwnProfile =
    !!address &&
    !!ownerAddress &&
    address.toLowerCase() === (ownerAddress as string).toLowerCase();

  const profileUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/profile?u=${username}`;

  useEffect(() => {
    if (!revokeAttestation.isSuccess) return;
    refetchAttestations();
    refetchHasAttested();
    // Clear the write result, or isSuccess stays true and the success banner
    // sticks for the life of the page.
    revokeAttestation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revokeAttestation.isSuccess, refetchAttestations, refetchHasAttested]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const requireWallet = (action: () => void) => {
    if (!isConnected) {
      setNotice("Connect your wallet to attest or revoke.");
      return;
    }
    action();
  };

  if (!username) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-profile-border bg-profile-surface">
            <UserX size={24} className="text-profile-muted" />
          </div>
          <h1 className="font-utsaha text-2xl text-white">
            No profile specified
          </h1>
          <p className="mt-2 font-utsaha text-sm text-profile-muted">
            Please provide a username or profile id (pf-…) in the URL.
          </p>
        </div>
      </div>
    );
  }

  // First load only: a background refetch (e.g. after an edit) must not swap
  // the page for a spinner, which would also unmount the open edit modal.
  const isLoading =
    isResolvingUsername ||
    isProfileLoading ||
    (profileTokenId !== undefined && profileData === undefined);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-profile-accent border-t-transparent" />
          <p className="font-utsaha text-profile-muted">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.name) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-profile-border bg-profile-surface">
            <UserX size={24} className="text-profile-muted" />
          </div>
          <h1 className="font-utsaha text-2xl text-white">Profile not found</h1>
          <p className="mt-2 font-utsaha text-sm text-profile-muted">
            No profile is registered to{" "}
            <span className="text-white">&ldquo;{username}&rdquo;</span>.
          </p>
          <p className="mt-3 font-utsaha text-xs text-profile-muted">
            If you expected one here, check that your wallet is on the Sepolia
            network.
          </p>
        </div>
      </div>
    );
  }

  const revokeStatus: TxStatus = revokeAttestation.isPending
    ? "pending"
    : revokeAttestation.isConfirming
      ? "confirming"
      : revokeAttestation.isSuccess
        ? "success"
        : revokeAttestation.error
          ? "error"
          : "idle";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <ProfileHeader
        name={profileData.name}
        username={profileData.username}
        avatarId={profileData.avatarId || null}
        seed={(ownerAddress as string) ?? profileData.username}
        nationality={profileData.nationality}
        rank={rank}
        actions={
          <ProfileActions
            profileUrl={profileUrl}
            displayName={profileData.name}
            isOwnProfile={isOwnProfile}
            hasAttested={!!viewerHasAttested}
            isRevoking={revokeAttestation.isLoading}
            onAttest={() => requireWallet(() => setIsAttestModalOpen(true))}
            onRevoke={() =>
              requireWallet(() => {
                if (profileTokenId) revokeAttestation.write(profileTokenId);
              })
            }
            // The edit diff compares against the link slots, so wait for them
            // or an edit would read every slot as removed.
            onEdit={profileLinks ? () => setIsEditModalOpen(true) : undefined}
          />
        }
      />

      {notice && (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 font-utsaha text-sm text-amber-300">
          {notice}
        </p>
      )}

      {revokeStatus !== "idle" && (
        <TransactionStatus
          status={revokeStatus}
          txHash={revokeAttestation.txHash}
          error={revokeAttestation.error}
          successMessage="Attestation revoked."
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Reputation leads on mobile, sits in the right rail on desktop. */}
        <div className="lg:order-2 lg:col-span-1">
          <ProfileReputation
            trustScore={trustScore}
            totalAttestations={totalAttestations}
            rank={rank}
            onViewAttesters={() => setIsAttestersModalOpen(true)}
          />
        </div>

        <div className="flex flex-col gap-5 lg:order-1 lg:col-span-2">
          <ProfileLinks
            github={profileData.github}
            xDotCom={profileData.xDotCom}
            discord={profileData.discord}
            email={profileData.email}
            website={profileData.websitePortfolioLink}
            customLinks={customLinks}
          />

          <ProfileIdentity
            walletAddress={ownerAddress as string | undefined}
            ens={profileData.ens}
            profileTokenId={profileTokenId}
          />
        </div>
      </div>

      {isAttestersModalOpen && profileTokenId && (
        <AttestersModal
          isOpen
          onClose={() => setIsAttestersModalOpen(false)}
          tokenId={profileTokenId}
          tokenName={profileData.name}
        />
      )}

      {isEditModalOpen && profileTokenId && profileLinks && (
        <CreateProfileModal
          isOpen
          onClose={() => setIsEditModalOpen(false)}
          edit={{
            tokenId: profileTokenId,
            profile: profileData,
            links: profileLinks,
          }}
          onSuccess={() => {
            refetchProfile();
            refetchLinks();
          }}
        />
      )}

      {isAttestModalOpen && profileTokenId && (
        <AttestModal
          isOpen
          onClose={() => setIsAttestModalOpen(false)}
          tokenId={profileTokenId}
          tokenName={profileData.name}
          onSuccess={() => {
            refetchAttestations();
            refetchHasAttested();
          }}
        />
      )}
    </div>
  );
}
