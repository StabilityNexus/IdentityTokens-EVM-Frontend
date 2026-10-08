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
import { useCreateProfile, useUpdateProfile } from "@/hooks/useIdentityWrites";
import { useIdentityGate } from "@/hooks/useIdentityGate";
import { useUsernameTaken } from "@/hooks/useIdentityReads";
import { CreateProfileModalProps, TxStatus } from "@/lib/types";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { DEFAULT_AVATAR_ID, getRandomAvatarId } from "@/lib/avatars";
import {
  CustomLink,
  EMPTY_PROFILE_FORM,
  ProfileFormData,
  diffLinks,
  diffProfile,
  linksFromChain,
  normalizeProfile,
} from "@/lib/profileData";
import {
  FieldResult,
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

export function CreateProfileModal({
  isOpen,
  onClose,
  onSuccess,
  edit,
}: CreateProfileModalProps) {
  const isEdit = edit !== undefined;
  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_PROFILE_FORM);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [step, setStep] = useState<"idle" | "submitting">("idle");

  const { address, refetchHasProfile, refetchProfileTokenId } =
    useIdentityGate();

  // Editing keeps the existing username, which would read as "taken".
  const { data: isUsernameTaken, isLoading: isCheckingUsername } =
    useUsernameTaken(
      !isEdit && formData.username.length >= 3 ? formData.username : undefined
    );

  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const activeWrite = isEdit ? updateProfile : createProfile;

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
    if (isEdit) return { status: "idle" };
    const local = validateUsername(formData.username);
    if (local.status !== "valid") return local;
    if (isCheckingUsername) {
      return { status: "checking", message: "Checking availability…" };
    }
    if (isUsernameTaken) {
      return { status: "invalid", message: "That username is already taken." };
    }
    return { status: "valid", message: "Available." };
  }, [isEdit, formData.username, isCheckingUsername, isUsernameTaken]);

  const results = useMemo(
    () => ({
      name: validateName(formData.name),
      username: usernameResult,
      github: validateGithub(formData.github),
      xDotCom: validateX(formData.xDotCom),
      discord: validateDiscord(formData.discord),
      email: validateEmail(formData.email),
      website: validateWebsite(formData.websitePortfolioLink),
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
    !formData.name.trim() || (!isEdit && usernameResult.status !== "valid");

  // An edit sends only what differs from the chain, so an untouched form has
  // nothing to submit and each change costs one write.
  const diff = useMemo(
    () =>
      edit
        ? diffProfile(
            edit.profile,
            edit.links,
            normalizeProfile(formData, avatarId ?? edit.profile.avatarId),
            customLinks
          )
        : undefined,
    [edit, formData, avatarId, customLinks]
  );
  const changeCount = diff ? diff.fields.length + diff.links.length : 0;

  // Transaction flow

  const getTxStatus = (): TxStatus => {
    if (step === "submitting") {
      if (activeWrite.isPending) return "pending";
      if (activeWrite.isConfirming) return "confirming";
      if (activeWrite.isSuccess) return "success";
      if (activeWrite.error) return "error";
    }
    return "idle";
  };

  const txStatus = getTxStatus();
  const isSubmitting = txStatus === "pending" || txStatus === "confirming";

  const handleClose = useCallback(() => {
    setFormData(EMPTY_PROFILE_FORM);
    setAvatarId(null);
    setCustomLinks([]);
    setHasAttemptedSubmit(false);
    setStep("idle");
    createProfile.reset();
    updateProfile.reset();
    onClose();
  }, [onClose, createProfile, updateProfile]);

  // Keep the latest closer in a ref so the key listener below can stay stable.
  // The ref is written in an effect rather than during render — refs must not
  // be touched while rendering.
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(handleClose);
  useEffect(() => {
    closeRef.current = handleClose;
  }, [handleClose]);

  const submitProfile = useCallback(() => {
    setStep("submitting");
    if (edit && diff) {
      updateProfile.write(edit.tokenId, diff.fields, diff.links);
      return;
    }
    createProfile.write(
      normalizeProfile(formData, avatarId ?? DEFAULT_AVATAR_ID),
      diffLinks([], customLinks)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit, diff, formData, avatarId, customLinks]);

  // Seed the form each time the modal opens: an edit starts from what is
  // on-chain, a new profile from blank fields and a fresh random avatar. This
  // stays in an effect deliberately: deriving it during render would re-roll
  // the avatar on every keystroke, and a lazy useState initialiser would only
  // run once per mount rather than once per open. Later refetches of `edit`
  // must not clobber what the user is typing, so it is read only on open.
  useEffect(() => {
    if (!isOpen) return;
    if (edit) {
      setFormData(edit.profile);
      setAvatarId(edit.profile.avatarId || null);
      setCustomLinks(linksFromChain(edit.links));
      return;
    }
    setAvatarId((current) => current ?? getRandomAvatarId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    if (step === "submitting" && activeWrite.isSuccess) {
      if (!isEdit) {
        refetchHasProfile();
        refetchProfileTokenId();
      }
      const timer = setTimeout(() => {
        onSuccess?.();
        closeRef.current();
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, activeWrite.isSuccess]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    if (hasBlockingError || isMissingRequired) return;
    if (isEdit && changeCount === 0) return;

    submitProfile();
  };

  const currentError = activeWrite.error;
  const currentTxHash = activeWrite.txHash;

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
              {isEdit ? "Edit your profile" : "Create your public profile"}
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
                disabled={isSubmitting || isEdit}
                hint={
                  isEdit
                    ? "Usernames are permanent — your profile URL never changes."
                    : "3–32 characters. This becomes your profile URL."
                }
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
                value={formData.websitePortfolioLink}
                onChange={(value) => setField("websitePortfolioLink", value)}
                onApplySuggestion={(value) =>
                  setField("websitePortfolioLink", value)
                }
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
                successMessage={
                  isEdit
                    ? "Profile updated."
                    : "Profile created — welcome aboard!"
                }
              />
            </div>
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
                // The modal closes itself shortly after success; until then a
                // second click would resend the same write.
                txStatus === "success" ||
                !address ||
                (isEdit && changeCount === 0) ||
                (hasAttemptedSubmit && (hasBlockingError || isMissingRequired))
              }
              className="rounded-xl bg-brand-green px-6 py-2.5 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Creating profile…"
                : !address
                  ? "Connect wallet first"
                  : !isEdit
                    ? "Create profile"
                    : changeCount === 0
                      ? "No changes"
                      : `Save ${changeCount} change${changeCount === 1 ? "" : "s"}`}
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
