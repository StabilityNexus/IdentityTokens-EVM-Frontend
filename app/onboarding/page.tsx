"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { RegistrationModal } from "@/components/onboarding/RegistrationModal";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { getContractErrorMessage } from "@/lib/errors";
import { markTourPending, recordTermsAcceptance } from "@/lib/onboarding";

/** First stop after a wallet connects with no root identity. */
export default function OnboardingPage() {
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const {
    address,
    isConnected,
    hasRootIdentity,
    isResolved,
    isLoading,
    error,
  } = useOnboardingStatus();

  // The wallet this page put the form in front of, and whether that form
  // actually broadcast the transaction. An identity that appears without it —
  // created in another tab or by another client — was never consented to here.
  const askedFor = useRef<string | undefined>(undefined);
  const didSubmit = useRef(false);

  useEffect(() => {
    if (!isConnected || !isResolved || !address) return;

    if (!hasRootIdentity) {
      if (askedFor.current !== address) didSubmit.current = false;
      askedFor.current = address;
      return;
    }

    if (askedFor.current !== address || !didSubmit.current) {
      router.replace("/dashboard");
      return;
    }

    // Registered here: the flags are written here too, because the modal is
    // unmounted by this very render and its effects never run again.
    recordTermsAcceptance(address);
    markTourPending();
    router.replace("/dashboard?tour=1");
  }, [address, hasRootIdentity, isConnected, isResolved, router]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-app-bg px-4 py-12">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/assets/dark-logo.svg" alt="dit" width={36} height={36} />
        <span className="font-atyp text-3xl tracking-tight text-white">
          dit
        </span>
      </Link>

      {!isConnected ? (
        <div className="max-w-md text-center">
          <h1 className="font-utsaha text-2xl text-white">
            Connect your wallet to begin
          </h1>
          <p className="mt-2 font-utsaha text-sm text-gray-400">
            Your identity is created from your wallet — connect one to pick a
            display name and claim it.
          </p>
          <button
            type="button"
            onClick={() => openConnectModal?.()}
            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-green px-6 py-2.5 font-utsaha text-base font-semibold text-dashboard-bg shadow-md transition-transform duration-200 ease-out hover:scale-[1.02] hover:bg-brand-green/90 active:scale-[0.98]"
          >
            Connect Wallet
          </button>
        </div>
      ) : error ? (
        <div className="max-w-md text-center">
          <p className="font-utsaha text-lg text-white">
            Couldn&rsquo;t check your identity
          </p>
          <p className="mt-2 font-utsaha text-sm text-gray-400">
            {getContractErrorMessage(error)}
          </p>
          <p className="mt-3 font-utsaha text-xs text-gray-500">
            Check that your wallet is on the Sepolia network and try again.
          </p>
        </div>
      ) : isLoading || !isResolved ? (
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-gray-400">Checking your identity…</p>
        </div>
      ) : hasRootIdentity ? (
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
          <p className="font-utsaha text-gray-400">
            Taking you to your dashboard…
          </p>
        </div>
      ) : (
        <RegistrationModal
          onSubmitted={() => {
            didSubmit.current = true;
          }}
        />
      )}

      <Link
        href="/"
        className="font-utsaha text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-300"
      >
        Back to home
      </Link>
    </main>
  );
}
