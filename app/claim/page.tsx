"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import Navbar from "@/components/Navbar";
import { IDCard } from "@/components/cards/IDCard";
import { ReserveStatus } from "@/components/claim/ReserveStatus";
import { ReservedView } from "@/components/claim/ReservedView";
import { ShareCardModal } from "@/components/claim/ShareCardModal";
import { TermsConsent } from "@/components/claim/TermsConsent";
import { UsernameField } from "@/components/claim/UsernameField";
import { useRootId, useRootIdentityView } from "@/hooks/useIdentityReads";
import { useCreateRootIdentity } from "@/hooks/useIdentityWrites";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import {
  CLAIM_CHAIN,
  formatCardDate,
  normalizeUsernameInput,
} from "@/lib/claim";
import { markTourPending, recordTermsAcceptance } from "@/lib/onboarding";
import { TxStatus } from "@/lib/types";

const noSubscription = () => () => {};

export default function ClaimPage() {
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [termsNudge, setTermsNudge] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<unknown>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const createRoot = useCreateRootIdentity({ chainId: CLAIM_CHAIN.id });
  const availability = useUsernameAvailability(username);

  const {
    data: rootId,
    isSuccess: isRootLoaded,
    isError: isRootError,
    refetch: refetchRootId,
  } = useRootId(address, CLAIM_CHAIN.id);
  // Proceed on a failed read: the contract rejects a second root anyway.
  const isRootResolved = isRootLoaded || isRootError;
  const hasRoot = !!rootId && rootId > 0n;
  const { data: rootView } = useRootIdentityView(
    hasRoot ? rootId : undefined,
    CLAIM_CHAIN.id
  );
  const { data: balance } = useBalance({
    address,
    chainId: CLAIM_CHAIN.id,
    query: { enabled: !!address },
  });

  // Client-only, so the prerendered page carries no stale date.
  const todayLabel = useSyncExternalStore(
    noSubscription,
    () => formatCardDate(new Date()),
    () => ""
  );

  // The receipt can land after the root read flips; either means done.
  const isConfirmed = createRoot.isSuccess || (!!createRoot.txHash && hasRoot);

  const txStatus: TxStatus = createRoot.isPending
    ? "pending"
    : createRoot.isConfirming && !isConfirmed
      ? "confirming"
      : isConfirmed
        ? "success"
        : createRoot.error
          ? "error"
          : "idle";

  const isSubmitting =
    isSwitching || txStatus === "pending" || txStatus === "confirming";

  const hasExistingRoot = hasRoot && !createRoot.txHash;
  const reservedName = isConfirmed
    ? submittedName
    : hasExistingRoot
      ? (rootView?.displayName ?? null)
      : null;
  const isReserved = isConfirmed || hasExistingRoot;

  const cardName = isReserved ? (reservedName ?? "") : username;
  const cardDate =
    hasExistingRoot && rootView
      ? formatCardDate(new Date(Number(rootView.createdAt) * 1000))
      : todayLabel;

  // A new value per taken name, so each one shakes the card once.
  const shakeSignal =
    !isReserved && availability.status === "taken" ? `taken:${username}` : null;

  // Switching accounts starts the reservation over.
  useEffect(() => {
    createRoot.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on account change only
  }, [address]);

  // Poll until the new root is readable; nothing else refreshes that read.
  useEffect(() => {
    if (!createRoot.txHash || hasRoot) return;
    const poll = setInterval(() => refetchRootId(), 1500);
    return () => clearInterval(poll);
  }, [createRoot.txHash, hasRoot, refetchRootId]);

  // Same bookkeeping as /onboarding once the root identity exists.
  useEffect(() => {
    if (!isConfirmed || !address) return;
    recordTermsAcceptance(address);
    markTourPending();
    void queryClient.invalidateQueries({ queryKey: ["claim", "root-names"] });
  }, [isConfirmed, address, queryClient]);

  const handleUsernameChange = (value: string) => {
    setUsername(normalizeUsernameInput(value));
    setSwitchError(null);
    if (createRoot.error) createRoot.reset();
  };

  const handleAgreedChange = (agreed: boolean) => {
    setHasAgreed(agreed);
    if (agreed) setTermsNudge(false);
  };

  const handleReserve = async (event: React.FormEvent) => {
    event.preventDefault();
    if (availability.status !== "available" || isSubmitting) return;

    if (!hasAgreed) {
      setTermsNudge(true);
      return;
    }
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    if (!isRootResolved || hasRoot) return;

    setSwitchError(null);
    createRoot.reset();
    try {
      if (chainId !== CLAIM_CHAIN.id) {
        await switchChainAsync({ chainId: CLAIM_CHAIN.id });
      }
    } catch (error) {
      setSwitchError(error);
      return;
    }

    setSubmittedName(username);
    createRoot.write(username);
  };

  const handleSpinSettled = () => {
    if (isConfirmed) setIsShareOpen(true);
  };

  const isCheckingWallet = isConnected && !isRootResolved;

  const buttonLabel = isSwitching
    ? `Switching to ${CLAIM_CHAIN.name}…`
    : txStatus === "pending"
      ? "Confirm in your wallet…"
      : txStatus === "confirming"
        ? `Reserving @${submittedName}…`
        : availability.status === "checking"
          ? "Checking…"
          : availability.status === "available"
            ? isCheckingWallet
              ? "Checking your wallet…"
              : `Reserve @${username}`
            : "Choose your username";

  const isButtonDisabled =
    availability.status !== "available" || isSubmitting || isCheckingWallet;

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-landing-bg dark:bg-landing-bg-dark">
      <Navbar />

      <div
        aria-hidden="true"
        className="claim-grid pointer-events-none absolute inset-0 text-corner-stroke/70 dark:text-corner-stroke-dark"
      />

      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-24 pb-16 md:pt-28">
        <IDCard
          username={cardName}
          walletAddress={address}
          dateLabel={cardDate}
          spinning={isSubmitting && !isConfirmed}
          onSpinSettled={handleSpinSettled}
          shakeSignal={shakeSignal}
        />

        {isReserved ? (
          <ReservedView
            name={reservedName}
            isNew={isConfirmed}
            txHash={createRoot.txHash}
            onShare={() => setIsShareOpen(true)}
          />
        ) : (
          <form
            onSubmit={handleReserve}
            className="mt-14 flex w-full max-w-lg flex-col items-center text-center md:mt-16"
          >
            <h1 className="font-utsaha text-4xl leading-[1.1] font-normal md:text-6xl">
              <span className="block text-landhead-text dark:text-landhead-text-dark">
                Reserve your
              </span>
              <span className="block text-brand-blue">username.</span>
            </h1>
            <p className="mt-4 max-w-md font-utsaha text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
              Pick a unique username and claim your dit ID card before launch.
            </p>

            <div className="mt-7 w-full max-w-md">
              <UsernameField
                value={username}
                onChange={handleUsernameChange}
                availability={availability}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4 w-full max-w-md">
              <TermsConsent
                agreed={hasAgreed}
                onAgreedChange={handleAgreedChange}
                showNudge={termsNudge}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className="mt-6 claim-button-primary"
            >
              {isSubmitting && (
                <Loader2
                  size={18}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              {buttonLabel}
              {!isSubmitting && <ArrowUpRight size={18} aria-hidden="true" />}
            </button>

            <div className="mt-4 w-full max-w-md">
              <ReserveStatus
                switchError={switchError}
                txStatus={txStatus}
                txHash={createRoot.txHash}
                txError={createRoot.error}
                showHints={availability.status === "available" && !isSubmitting}
                onWrongChain={isConnected && chainId !== CLAIM_CHAIN.id}
                needsGas={isConnected && balance?.value === 0n}
              />
            </div>

            <p className="mt-6 max-w-sm font-utsaha text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Reserving mints your soulbound root identity on the Sepolia
              testnet. Your username is stored with it on-chain and can&rsquo;t
              be changed later.{" "}
              <Link
                href="/"
                className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Learn more about dit
              </Link>
            </p>
          </form>
        )}
      </section>

      {reservedName && (
        <ShareCardModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          username={reservedName}
          walletAddress={address}
          dateLabel={cardDate}
          txHash={isConfirmed ? createRoot.txHash : undefined}
        />
      )}
    </main>
  );
}
