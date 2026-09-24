"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useCreateRootIdentity } from "@/hooks/useIdentityWrites";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { TextField } from "@/components/forms/fields/TextField";
import { TERMS_SUMMARY } from "@/lib/constants";
import { RegistrationModalProps, TxStatus } from "@/lib/types";
import { validateName } from "@/lib/validation";
import { truncateAddress } from "@/lib/helpers";

/** Display name + consent, then the `createRootIdentity` transaction. */
// The contract has no terms flag: that signed transaction is the acceptance record.
export function RegistrationModal({ onSubmitted }: RegistrationModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
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

      createRoot.write(displayName.trim());
    },
    [
      address,
      createRoot,
      displayName,
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
            One transaction creates the root identity that every token and
            attestation of yours hangs from.
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
          hint="Stored on-chain with your root identity. You can add a full public profile later."
        />

        {/* Terms, shown rather than linked away to. */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-profile-accent-soft" />
            <h3 className="font-utsaha text-sm text-gray-300">
              Terms &amp; Conditions
            </h3>
          </div>

          <ul className="no-scrollbar max-h-40 list-disc space-y-2 overflow-y-auto rounded-xl border border-white/8 bg-modal-inner-bg px-6 py-3.5 font-utsaha text-xs leading-relaxed text-gray-400">
            {TERMS_SUMMARY.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>

          <label className="flex cursor-pointer items-start gap-2.5 font-utsaha text-sm text-gray-300">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(event) => setHasAgreed(event.target.checked)}
              disabled={isSubmitting || isDone}
              required
              aria-describedby="terms-error"
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-green"
            />
            <span>
              I have read and agree to the Terms &amp; Conditions above and the{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue-link underline underline-offset-2 hover:opacity-80"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {hasAttemptedSubmit && !hasAgreed && (
            <p id="terms-error" className="font-utsaha text-xs text-red-400">
              You need to accept the terms before creating your identity.
            </p>
          )}
        </div>

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
