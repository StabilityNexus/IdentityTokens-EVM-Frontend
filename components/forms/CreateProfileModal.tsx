"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useCreateProfile } from "@/hooks/useIdentityWrites";
import { useCreateRootIdentity } from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { useUsernameTaken } from "@/hooks/useIdentityReads";
import { CreateProfileModalProps, TxStatus } from "@/lib/types";
import {
  TransactionStatus,
} from "@/components/ui/TransactionStatus";

interface ProfileFormData {
  name: string;
  username: string;
  age: string;
  nationality: string;
  github: string;
  email: string;
  discord: string;
  xDotCom: string;
  websitePortfolioLink: string;
  ens: string;
}

const INITIAL_FORM: ProfileFormData = {
  name: "",
  username: "",
  age: "",
  nationality: "",
  github: "",
  email: "",
  discord: "",
  xDotCom: "",
  websitePortfolioLink: "",
  ens: "",
};

export function CreateProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});

  const { hasRootIdentity, address, refetchHasProfile, refetchRootId } =
    useIdentityGate();

  // Check username availability (debounced by query enabled condition)
  const { data: isUsernameTaken, isLoading: isCheckingUsername } =
    useUsernameTaken(
      formData.username.length >= 3 ? formData.username : undefined,
    );

  // Write hooks
  const createRoot = useCreateRootIdentity();
  const createProfile = useCreateProfile();

  // Track which step we're on for multi-step flow
  const [step, setStep] = useState<"idle" | "creating-root" | "creating-profile">("idle");

  // Determine transaction status
  const getTxStatus = (): TxStatus => {
    if (step === "creating-root") {
      if (createRoot.isPending) return "pending";
      if (createRoot.isConfirming) return "confirming";
      if (createRoot.error) return "error";
    }
    if (step === "creating-profile") {
      if (createProfile.isPending) return "pending";
      if (createProfile.isConfirming) return "confirming";
      if (createProfile.isSuccess) return "success";
      if (createProfile.error) return "error";
    }
    return "idle";
  };

  // After root creation succeeds, proceed to profile creation
  useEffect(() => {
    if (step === "creating-root" && createRoot.isSuccess) {
      refetchRootId();
      // Small delay to let the chain state update
      const timer = setTimeout(() => {
        submitProfile();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createRoot.isSuccess]);

  // After profile creation succeeds, clean up
  useEffect(() => {
    if (step === "creating-profile" && createProfile.isSuccess) {
      refetchHasProfile();
      const timer = setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createProfile.isSuccess]);

  const handleClose = useCallback(() => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setStep("idle");
    createRoot.reset();
    createProfile.reset();
    onClose();
  }, [onClose, createRoot, createProfile]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Username: enforce lowercase, valid chars only
    if (name === "username") {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9._]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    } else if (formData.username.length > 32) {
      newErrors.username = "Username must be 32 characters or fewer.";
    } else if (isUsernameTaken) {
      newErrors.username = "This username is already taken.";
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0)) {
      newErrors.age = "Please enter a valid age.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitProfile = () => {
    setStep("creating-profile");
    createProfile.write({
      name: formData.name,
      username: formData.username,
      age: BigInt(formData.age || "0"),
      nationality: formData.nationality,
      github: formData.github,
      email: formData.email,
      discord: formData.discord,
      xDotCom: formData.xDotCom,
      websitePortfolioLink: formData.websitePortfolioLink,
      ens: formData.ens,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!hasRootIdentity) {
      // Need to create root identity first
      setStep("creating-root");
      createRoot.write(formData.name);
    } else {
      submitProfile();
    }
  };

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";
  const currentError = step === "creating-root" ? createRoot.error : createProfile.error;
  const currentTxHash =
    step === "creating-root" ? createRoot.txHash : createProfile.txHash;

  // Input field helper
  const inputClass =
    "w-full rounded-lg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none";
  const inputStyle = {
    backgroundColor: "var(--color-modal-inner-bg)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200"
      onClick={handleClose}
    >
      <div
        className="animate-in zoom-in-95 relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 shadow-2xl duration-200 md:max-w-2xl md:p-8"
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
          <h2 className="font-utsaha text-2xl text-white">Create Profile</h2>
          <p className="mt-1 font-utsaha text-sm text-gray-400">
            Set up your on-chain identity profile
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your display name"
              className={inputClass}
              style={inputStyle}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-utsaha text-sm text-gray-300">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. john_doe.eth"
              className={inputClass}
              style={inputStyle}
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              {formData.username.length >= 3 && (
                <>
                  {isCheckingUsername ? (
                    <span className="text-xs text-gray-500">Checking availability…</span>
                  ) : isUsernameTaken ? (
                    <span className="text-xs text-red-500">Username taken</span>
                  ) : (
                    <span className="text-xs text-brand-green">Available ✓</span>
                  )}
                </>
              )}
            </div>
            {errors.username && (
              <span className="text-xs text-red-500">{errors.username}</span>
            )}
          </div>

          {/* Age & Nationality in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Your age"
                className={inputClass}
                style={inputStyle}
                min={0}
                disabled={isSubmitting}
              />
              {errors.age && (
                <span className="text-xs text-red-500">{errors.age}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Your nationality"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Socials Section Header */}
          <div className="mt-2 border-t border-white/5 pt-4">
            <h3 className="font-utsaha text-lg text-gray-300">
              Socials{" "}
              <span className="text-sm text-gray-500">(optional)</span>
            </h3>
          </div>

          {/* GitHub & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">
                GitHub
              </label>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="github.com/username"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Discord & X */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">
                Discord
              </label>
              <input
                type="text"
                name="discord"
                value={formData.discord}
                onChange={handleChange}
                placeholder="username#0000"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">
                X (Twitter)
              </label>
              <input
                type="text"
                name="xDotCom"
                value={formData.xDotCom}
                onChange={handleChange}
                placeholder="@handle"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Website & ENS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">
                Website / Portfolio
              </label>
              <input
                type="url"
                name="websitePortfolioLink"
                value={formData.websitePortfolioLink}
                onChange={handleChange}
                placeholder="https://yoursite.com"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-utsaha text-sm text-gray-300">ENS</label>
              <input
                type="text"
                name="ens"
                value={formData.ens}
                onChange={handleChange}
                placeholder="yourname.eth"
                className={inputClass}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Transaction Status */}
          <TransactionStatus
            status={txStatus}
            txHash={currentTxHash}
            error={currentError}
            successMessage="Profile created successfully!"
          />

          {/* Submit */}
          <div className="mt-2">
            <button
              type="submit"
              disabled={isSubmitting || !address}
              className="w-full rounded-lg bg-brand-green py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Creating Profile…"
                : !address
                  ? "Connect Wallet First"
                  : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
