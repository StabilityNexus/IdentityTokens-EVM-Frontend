"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import {
  useCreateToken,
  useCreateRootIdentity,
} from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { CreateTokenModalProps, TxStatus } from "@/lib/types";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { truncateAddress } from "@/lib/helpers";

export const tokenSchema = z.object({
  name: z.string().min(1, "Token Name is required"),
  type: z.string().min(1, "Token Type is required"),
  value: z.string().min(1, "Token Value is required"),
  about: z.string().optional(),
  validUntil: z.string().optional(), // ISO date string, empty = no expiry
});

type TokenState = z.infer<typeof tokenSchema>;

export function CreateTokenModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTokenModalProps) {
  const [tokenState, setTokenState] = useState<TokenState>({
    name: "",
    type: "",
    value: "",
    about: "",
    validUntil: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TokenState, string>>
  >({});

  const { hasRootIdentity, address, refetchRootId, refetchWalletTokens } =
    useIdentityGate();

  // Write hooks
  const createRoot = useCreateRootIdentity();
  const createToken = useCreateToken();

  const [step, setStep] = useState<"idle" | "creating-root" | "creating-token">(
    "idle"
  );

  // Declared ahead of the effects below, which call them from their timers.
  const handleClose = useCallback(() => {
    setTokenState({ name: "", type: "", value: "", about: "", validUntil: "" });
    setErrors({});
    setStep("idle");
    createRoot.reset();
    createToken.reset();
    onClose();
  }, [onClose, createRoot, createToken]);

  const submitToken = useCallback(() => {
    // Convert validUntil date to Unix timestamp (0 = no expiry)
    let validUntilTimestamp = 0n;
    if (tokenState.validUntil) {
      const date = new Date(tokenState.validUntil);
      validUntilTimestamp = BigInt(Math.floor(date.getTime() / 1000));
    }

    setStep("creating-token");
    createToken.write({
      tokenName: tokenState.name,
      tokenType: tokenState.type,
      tokenValue: tokenState.value,
      about: tokenState.about || "",
      validUntil: validUntilTimestamp,
    });
  }, [tokenState, createToken]);

  // After root creation succeeds, proceed to token creation
  useEffect(() => {
    if (step === "creating-root" && createRoot.isSuccess) {
      refetchRootId();
      const timer = setTimeout(() => {
        submitToken();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createRoot.isSuccess]);

  // After token creation succeeds, clean up
  useEffect(() => {
    if (step === "creating-token" && createToken.isSuccess) {
      refetchWalletTokens();
      const timer = setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createToken.isSuccess]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setTokenState((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof TokenState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = tokenSchema.safeParse(tokenState);
    if (!result.success) {
      const newErrors: Partial<Record<keyof TokenState, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as keyof TokenState] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Validate validUntil is in the future if set
    if (tokenState.validUntil) {
      const date = new Date(tokenState.validUntil);
      if (date.getTime() <= Date.now()) {
        setErrors((prev) => ({
          ...prev,
          validUntil: "Expiry must be in the future.",
        }));
        return;
      }
    }

    if (!hasRootIdentity) {
      setStep("creating-root");
      // An empty display name leaves the root identity nameless everywhere it
      // is shown later, so fall back to the wallet address.
      createRoot.write(address ? truncateAddress(address) : "");
    } else {
      submitToken();
    }
  };

  const getTxStatus = (): TxStatus => {
    if (step === "creating-root") {
      if (createRoot.isPending) return "pending";
      if (createRoot.isConfirming) return "confirming";
      if (createRoot.error) return "error";
    }
    if (step === "creating-token") {
      if (createToken.isPending) return "pending";
      if (createToken.isConfirming) return "confirming";
      if (createToken.isSuccess) return "success";
      if (createToken.error) return "error";
    }
    return "idle";
  };

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";
  const currentError =
    step === "creating-root" ? createRoot.error : createToken.error;
  const currentTxHash =
    step === "creating-root" ? createRoot.txHash : createToken.txHash;

  // Minimum date for the date picker (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      onClick={handleClose}
    >
      <div
        className="animate-in zoom-in-95 relative w-full max-w-xl rounded-2xl p-6 shadow-2xl duration-200 md:max-w-2xl md:p-8"
        style={{
          backgroundColor: "var(--color-app-bg)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-utsaha text-2xl text-white">
            Mint Identity Token
          </h2>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Token Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              Token Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={tokenState.name}
              onChange={handleChange}
              placeholder="Enter the token name"
              disabled={isSubmitting}
              className="w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-modal-inner-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Token Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              Token Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={tokenState.type}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full appearance-none rounded-lg px-4 py-2 font-utsaha text-white transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-modal-inner-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <option value="" disabled>
                Select a Token Type
              </option>
              <option value="education">Education Credential</option>
              <option value="professional">Professional Skill</option>
              <option value="achievement">Achievement</option>
              <option value="identity">Identity Document</option>
              <option value="socials">Socials</option>
            </select>
            {errors.type && (
              <span className="text-xs text-red-500">{errors.type}</span>
            )}
          </div>

          {/* Token Value */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              Token Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="value"
              value={tokenState.value}
              onChange={handleChange}
              placeholder="Enter the token value"
              disabled={isSubmitting}
              className="w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-modal-inner-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            {errors.value && (
              <span className="text-xs text-red-500">{errors.value}</span>
            )}
          </div>

          {/* About Token */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              About Token
            </label>
            <textarea
              name="about"
              value={tokenState.about}
              onChange={handleChange}
              rows={3}
              placeholder="Describe this identity token…"
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-modal-inner-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Valid Until (Expiry Date) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              Valid Until{" "}
              <span className="text-xs text-gray-500">
                (leave empty for no expiry)
              </span>
            </label>
            <input
              type="date"
              name="validUntil"
              value={tokenState.validUntil}
              onChange={handleChange}
              min={minDate}
              disabled={isSubmitting}
              className="w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-modal-inner-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
                colorScheme: "dark",
              }}
            />
            {errors.validUntil && (
              <span className="text-xs text-red-500">{errors.validUntil}</span>
            )}
          </div>

          {/* Transaction Status */}
          <TransactionStatus
            status={txStatus}
            txHash={currentTxHash}
            error={currentError}
            successMessage="Token minted successfully!"
          />

          {/* Submit */}
          <div className="mt-2">
            <button
              type="submit"
              disabled={isSubmitting || !address}
              className="w-full rounded-lg bg-brand-green py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Minting…"
                : !address
                  ? "Connect Wallet First"
                  : "Mint Identity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
