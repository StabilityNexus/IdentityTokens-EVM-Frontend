"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AtSign, Globe, Mail, X } from "lucide-react";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";
import {
  useCreateProfile,
  useCreateRootIdentity,
} from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { useUsernameTaken } from "@/hooks/useIdentityReads";
import { CreateProfileModalProps, TxStatus } from "@/lib/types";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { DEFAULT_AVATAR_ID, getRandomAvatarId } from "@/lib/avatars";
import { CustomLink, encodeProfileExtras } from "@/lib/profileExtras";
import {
  FieldResult,
  normalizeWebsite,
  validateAge,
  validateDiscord,
  validateEmail,
  validateEns,
  validateGithub,
  validateName,
  validateUsername,
  validateWebsite,
  validateX,
} from "@/lib/validation";
import { AvatarPicker } from "./fields/AvatarPicker";
import { CountrySelect } from "./fields/CountrySelect";
import {
  CustomLinksField,
  hasCustomLinkError,
} from "./fields/CustomLinksField";
import { TextField } from "./fields/TextField";

interface ProfileFormData {
  name: string;
  username: string;
  age: string;
  nationality: string;
  github: string;
  email: string;
  discord: string;
  xDotCom: string;
  website: string;
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
  website: "",
  ens: "",
};

export function CreateProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [step, setStep] = useState<
    "idle" | "creating-root" | "creating-profile"
  >("idle");

  const { hasRootIdentity, address, refetchHasProfile, refetchRootId } =
    useIdentityGate();

  const { data: isUsernameTaken, isLoading: isCheckingUsername } =
    useUsernameTaken(
      formData.username.length >= 3 ? formData.username : undefined
    );

  const createRoot = useCreateRootIdentity();
  const createProfile = useCreateProfile();

  const setField = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K]
  ) => setFormData((previous) => ({ ...previous, [key]: value }));

  // Live validation

  /**
   * Username combines local character rules with the on-chain availability
   * check, so a single field message covers both.
   */
  const usernameResult = useMemo<FieldResult>(() => {
    const local = validateUsername(formData.username);
    if (local.status !== "valid") return local;
    if (isCheckingUsername) {
      return { status: "checking", message: "Checking availability…" };
    }
    if (isUsernameTaken) {
      return { status: "invalid", message: "That username is already taken." };
    }
    return { status: "valid", message: "Available." };
  }, [formData.username, isCheckingUsername, isUsernameTaken]);

  const results = useMemo(
    () => ({
      name: validateName(formData.name),
      username: usernameResult,
      age: validateAge(formData.age),
      github: validateGithub(formData.github),
      xDotCom: validateX(formData.xDotCom),
      discord: validateDiscord(formData.discord),
      email: validateEmail(formData.email),
      website: validateWebsite(formData.website),
      ens: validateEns(formData.ens),
    }),
    [formData, usernameResult]
  );

  // Custom links are validated by the field itself, so fold its verdict in
  // here too -- otherwise a row showing a red error still submits and writes a
  // dead link on-chain.
  const hasBlockingError =
    Object.values(results).some((result) => result.status === "invalid") ||
    hasCustomLinkError(customLinks);
  const isMissingRequired =
    !formData.name.trim() || usernameResult.status !== "valid";

  // Transaction flow

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

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";

  const handleClose = useCallback(() => {
    setFormData(INITIAL_FORM);
    setAvatarId(null);
    setCustomLinks([]);
    setHasAttemptedSubmit(false);
    setStep("idle");
    createRoot.reset();
    createProfile.reset();
    onClose();
  }, [onClose, createRoot, createProfile]);

  // Keep the latest closer in a ref so the key listener below can stay stable.
  // The ref is written in an effect rather than during render — refs must not
  // be touched while rendering.
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(handleClose);
  useEffect(() => {
    closeRef.current = handleClose;
  }, [handleClose]);

  const submitProfile = useCallback(() => {
    setStep("creating-profile");
    createProfile.write({
      name: formData.name.trim(),
      username: formData.username.trim(),
      // Number() first: validateAge accepts exponent and decimal forms such as
      // "2e1", which BigInt() rejects outright.
      age: BigInt(Number(formData.age || "0")),
      nationality: formData.nationality,
      github: formData.github.trim(),
      email: formData.email.trim(),
      discord: formData.discord.trim(),
      xDotCom: formData.xDotCom.trim().replace(/^@/, ""),
      // Avatar and custom links ride along inside this field until the
      // contract grows dedicated slots — see lib/profileExtras.ts.
      websitePortfolioLink: encodeProfileExtras(
        normalizeWebsite(formData.website),
        {
          avatarId: avatarId ?? DEFAULT_AVATAR_ID,
          customLinks,
        }
      ),
      ens: formData.ens.trim(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, avatarId, customLinks]);

  // Give the modal a fresh random avatar each time it opens. This stays in an
  // effect deliberately: deriving it during render would re-roll the avatar on
  // every keystroke, and a lazy useState initialiser would only ever pick once
  // per mount rather than once per open.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setAvatarId((current) => current ?? getRandomAvatarId());
  }, [isOpen]);

  // Escape to dismiss, background scroll lock, and focus management: pull focus
  // into the dialog on open, keep Tab cycling inside it, and hand focus back to
  // whatever opened it on close.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
        // Skip anything currently hidden, so the cycle matches what is on screen.
      ).filter((element) => element.getClientRects().length > 0);

    const initial = focusable();
    const firstField = initial.find((element) =>
      ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)
    );
    (firstField ?? initial[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const cycle = focusable();
      if (cycle.length === 0) return;

      const first = cycle[0];
      const last = cycle[cycle.length - 1];
      const active = document.activeElement;
      const escaped = !dialogRef.current?.contains(active);

      if (event.shiftKey && (active === first || escaped)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || escaped)) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  // Root identity must exist before a profile can be minted.
  useEffect(() => {
    if (step === "creating-root" && createRoot.isSuccess) {
      refetchRootId();
      const timer = setTimeout(() => submitProfile(), 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createRoot.isSuccess]);

  useEffect(() => {
    if (step === "creating-profile" && createProfile.isSuccess) {
      refetchHasProfile();
      const timer = setTimeout(() => {
        onSuccess?.();
        closeRef.current();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createProfile.isSuccess]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    if (hasBlockingError || isMissingRequired) return;

    if (!hasRootIdentity) {
      setStep("creating-root");
      createRoot.write(formData.name.trim());
    } else {
      submitProfile();
    }
  };

  const currentError =
    step === "creating-root" ? createRoot.error : createProfile.error;
  const currentTxHash =
    step === "creating-root" ? createRoot.txHash : createProfile.txHash;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm duration-200 sm:items-center"
      onClick={() => !isSubmitting && handleClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-profile-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-in zoom-in-95 relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/8 bg-app-bg shadow-2xl duration-200"
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="relative shrink-0 overflow-hidden border-b border-white/8 px-6 py-5 md:px-8">
          <div
            aria-hidden="true"
            className="gradient-profile-cover pointer-events-none absolute inset-0 opacity-60"
          />
          <div className="relative">
            <h2
              id="create-profile-title"
              className="font-utsaha text-2xl text-white"
            >
              Create your public profile
            </h2>
            <p className="mt-1 max-w-lg font-utsaha text-sm text-gray-400">
              Your profile data will be stored on a public blockchain. Only
              include information that you are comfortable making permanently
              public
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <form
          id="create-profile-form"
          onSubmit={handleSubmit}
          className="no-scrollbar flex-1 overflow-y-auto px-6 py-6 md:px-8"
        >
          <Section index={1} title="Identity">
            <AvatarPicker
              value={avatarId}
              onChange={setAvatarId}
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Display name"
                name="name"
                value={formData.name}
                onChange={(value) => setField("name", value)}
                result={
                  hasAttemptedSubmit && !formData.name.trim()
                    ? { status: "invalid", message: "Name is required." }
                    : results.name
                }
                placeholder="Enter your Full Name"
                maxLength={64}
                required
                disabled={isSubmitting}
              />

              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={(value) =>
                  setField(
                    "username",
                    value.toLowerCase().replace(/[^a-z0-9._]/g, "")
                  )
                }
                result={results.username}
                prefix="dit.id/"
                placeholder="Enter your Username"
                maxLength={32}
                required
                disabled={isSubmitting}
                hint="3–32 characters. This becomes your profile URL."
              />

              <TextField
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={(value) => setField("age", value)}
                result={results.age}
                placeholder="Enter your Age"
                min={13}
                max={120}
                disabled={isSubmitting}
              />

              <CountrySelect
                value={formData.nationality}
                onChange={(value) => setField("nationality", value)}
                disabled={isSubmitting}
              />
            </div>
          </Section>

          <Section
            index={2}
            title="Social handles"
            description="Enter your username only — not the full profile link."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="GitHub"
                name="github"
                value={formData.github}
                onChange={(value) => setField("github", value)}
                onApplySuggestion={(value) => setField("github", value)}
                result={results.github}
                icon={<FaGithub size={15} />}
                prefix="github.com/"
                placeholder="Enter your GitHub Username"
                disabled={isSubmitting}
              />

              <TextField
                label="X"
                name="xDotCom"
                value={formData.xDotCom}
                onChange={(value) => setField("xDotCom", value)}
                onApplySuggestion={(value) => setField("xDotCom", value)}
                result={results.xDotCom}
                icon={<FaXTwitter size={14} />}
                prefix="x.com/"
                placeholder="Enter your X Handle"
                disabled={isSubmitting}
              />

              <TextField
                label="Discord"
                name="discord"
                value={formData.discord}
                onChange={(value) => setField("discord", value)}
                onApplySuggestion={(value) => setField("discord", value)}
                result={results.discord}
                icon={<FaDiscord size={15} />}
                placeholder="Enter your Discord Username"
                disabled={isSubmitting}
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setField("email", value)}
                result={results.email}
                icon={<Mail size={15} />}
                placeholder="Enter your Email"
                disabled={isSubmitting}
              />
            </div>
          </Section>

          <Section index={3} title="Links" isLast>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Website / portfolio"
                name="website"
                value={formData.website}
                onChange={(value) => setField("website", value)}
                onApplySuggestion={(value) => setField("website", value)}
                result={results.website}
                icon={<Globe size={15} />}
                placeholder="Enter your Website URL"
                disabled={isSubmitting}
              />

              <TextField
                label="ENS"
                name="ens"
                value={formData.ens}
                onChange={(value) => setField("ens", value)}
                onApplySuggestion={(value) => setField("ens", value)}
                result={results.ens}
                icon={<AtSign size={15} />}
                placeholder="Enter your ENS Name"
                disabled={isSubmitting}
              />
            </div>

            <CustomLinksField
              links={customLinks}
              onChange={setCustomLinks}
              disabled={isSubmitting}
            />
          </Section>
        </form>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-white/8 bg-app-bg px-6 py-4 md:px-8">
          {txStatus !== "idle" && (
            <div className="mb-3">
              <TransactionStatus
                status={txStatus}
                txHash={currentTxHash}
                error={currentError}
                successMessage="Profile created — welcome aboard!"
              />
            </div>
          )}

          {step === "creating-root" && !createRoot.error && (
            <p className="mb-3 font-utsaha text-xs text-gray-400">
              Step 1 of 2 — creating your root identity first. You&rsquo;ll be
              asked to confirm a second transaction for the profile itself.
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-5 py-2.5 font-utsaha text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="create-profile-form"
              disabled={
                isSubmitting ||
                !address ||
                (hasAttemptedSubmit && (hasBlockingError || isMissingRequired))
              }
              className="rounded-xl bg-brand-green px-6 py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? "Creating profile…"
                : !address
                  ? "Connect wallet first"
                  : "Create profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  description,
  isLast = false,
  children,
}: {
  index: number;
  title: string;
  description?: string;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={isLast ? "pb-1" : "mb-7 border-b border-white/6 pb-7"}>
      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-profile-accent/40 bg-profile-accent/10 font-utsaha text-xs text-profile-accent-soft">
          {index}
        </span>
        <h3 className="font-utsaha text-lg text-white">{title}</h3>
        {description && (
          <span className="font-utsaha text-xs text-gray-500">
            {description}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
