"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCreateRootIdentity } from "@/hooks/useIdentityWrites";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { DonationCheckbox } from "@/components/ui/DonationCheckbox";
import { TextField } from "@/components/forms/fields/TextField";
import { TermsConsent } from "@/components/terms/TermsConsent";
import { RegistrationModalProps, TxStatus } from "@/lib/types";
import { validateName } from "@/lib/validation";
import { truncateAddress } from "@/lib/helpers";

/** Display name + consent, then the `createRootIdentity` transaction. */
// The contract has no terms flag: that signed transaction is the acceptance record.
export function RegistrationModal({ onSubmitted }: RegistrationModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [donate, setDonate] = useState(true);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { address, hasRootIdentity, refetchRootId } = useOnboardingStatus();
  const createRoot = useCreateRootIdentity();

  const nameResult = useMemo(() => validateName(displayName), [displayName]);
  const isNameMissing = !displayName.trim();

  // The receipt can lag behind the identity read, which refetches as soon as
  // the wallet popup hands focus back. Either one means we are done.
  const isConfirmed =
    createRoot.isSuccess || (!!createRoot.txHash && hasRootIdentity);

  const txStatus: TxStatus = createRoot.isPending
    ? "pending"
    : createRoot.isConfirming && !isConfirmed
      ? "confirming"
      : isConfirmed
        ? "success"
        : createRoot.error
          ? "error"
          : "idle";

  const isSubmitting = txStatus === "pending" || txStatus === "confirming";
  const isDone = txStatus === "success";

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setHasAttemptedSubmit(true);
      if (isNameMissing || nameResult.status === "invalid") return;
      if (!hasAgreed || !address || isSubmitting || isDone) return;

      createRoot.write(displayName.trim(), donate);
    },
    [
      address,
      createRoot,
      displayName,
      donate,
      hasAgreed,
      isDone,
      isNameMissing,
      isSubmitting,
      nameResult.status,
    ]
  );

  // Reported while this modal is still mounted: the identity read flipping is
  // what unmounts it, and the page needs to know the consent came from here.
  useEffect(() => {
    if (!createRoot.txHash) return;
    onSubmitted?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRoot.txHash]);

  // Polls until the root is actually readable — the receipt alone is not
  // enough, and stopping there can leave the page waiting on a read that
  // nothing else refetches.
  useEffect(() => {
    if (!createRoot.txHash || hasRootIdentity) return;

    const poll = setInterval(() => refetchRootId(), 1500);
    return () => clearInterval(poll);
  }, [createRoot.txHash, hasRootIdentity, refetchRootId]);

  const isSubmitDisabled =
    !address ||
    isSubmitting ||
    isDone ||
    !hasAgreed ||
    isNameMissing ||
    nameResult.status === "invalid";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-title"
      className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/8 bg-app-bg shadow-2xl"
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/8 px-6 py-5 md:px-8">
        <div
          aria-hidden="true"
          className="gradient-profile-cover pointer-events-none absolute inset-0 opacity-60"
        />
        <div className="relative">
          <h2
            id="registration-title"
            className="font-utsaha text-2xl text-white"
          >
            Claim your identity
          </h2>
          <p className="mt-1 font-utsaha text-sm text-gray-400">
            One transaction creates the identity that all your tokens and
            attestations belong to.
          </p>
          {address && (
            <p className="mt-2 font-mono text-xs text-gray-500">
              {truncateAddress(address, 6, 4)}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <form
        id="registration-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-6 py-6 md:px-8"
      >
        <TextField
          label="Display name"
          name="displayName"
          value={displayName}
          onChange={setDisplayName}
          result={
            hasAttemptedSubmit && isNameMissing
              ? { status: "invalid", message: "A display name is required." }
              : nameResult
          }
          placeholder="How should people know you?"
          maxLength={64}
          required
          disabled={isSubmitting || isDone}
          hint="Stored on-chain with your identity. You can add a full public profile later."
        />

        <TermsConsent
          agreed={hasAgreed}
          onAgreedChange={setHasAgreed}
          error={
            hasAttemptedSubmit
              ? "Accept the Terms of Use before creating your identity."
              : undefined
          }
          disabled={isSubmitting || isDone}
        />

        <DonationCheckbox
          checked={donate}
          onChange={setDonate}
          disabled={isSubmitting || isDone}
        />

        {txStatus !== "idle" && (
          <TransactionStatus
            status={txStatus}
            txHash={createRoot.txHash}
            error={createRoot.error}
            successMessage="Identity created — taking you to your dashboard…"
          />
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="rounded-xl bg-brand-green px-6 py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!address
            ? "Connect wallet first"
            : isSubmitting
              ? "Creating your identity…"
              : isDone
                ? "Identity created"
                : "Create my identity"}
        </button>
      </form>
    </motion.div>
  );
}

export default RegistrationModal;
