"use client";

import React, { useState } from "react";
import { Check, Copy, Share2, ShieldCheck, ShieldMinus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileActionsProps {
  profileUrl: string;
  displayName: string;
  /** Viewers can't attest their own profile. */
  isOwnProfile: boolean;
  /** Whether the connected wallet already has an active attestation. */
  hasAttested: boolean;
  isRevoking?: boolean;
  onAttest: () => void;
  onRevoke: () => void;
  className?: string;
}

export function ProfileActions({
  profileUrl,
  displayName,
  isOwnProfile,
  hasAttested,
  isRevoking = false,
  onAttest,
  onRevoke,
  className,
}: ProfileActionsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions — fail quietly rather than
      // interrupting with an alert.
    }
  };

  const share = async () => {
    const shareData = {
      title: `${displayName} on DIT`,
      text: `Check out ${displayName}'s on-chain profile.`,
      url: profileUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User dismissed the sheet, or sharing is unavailable — fall through.
      }
    }

    await copyUrl();
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {!isOwnProfile && (
        <>
          <button
            type="button"
            onClick={onAttest}
            className="flex items-center gap-2 rounded-xl bg-profile-accent px-4 py-2.5 font-utsaha text-sm text-[#1a1033] transition-all hover:bg-profile-accent-soft active:scale-[0.98] sm:text-base"
          >
            <ShieldCheck size={16} />
            Attest
          </button>

          {hasAttested && (
            <button
              type="button"
              onClick={onRevoke}
              disabled={isRevoking}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-utsaha text-sm text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50 sm:text-base"
            >
              <ShieldMinus size={16} />
              {isRevoking ? "Revoking…" : "Revoke"}
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={share}
        aria-label="Share this profile"
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 font-utsaha text-sm text-gray-200 transition-colors hover:border-profile-accent/40 hover:text-white"
      >
        {shared ? (
          <Check size={16} className="text-brand-green" />
        ) : (
          <Share2 size={16} />
        )}
        <span className="hidden sm:inline">{shared ? "Copied" : "Share"}</span>
      </button>

      <button
        type="button"
        onClick={copyUrl}
        aria-label="Copy profile link"
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 font-utsaha text-sm text-gray-200 transition-colors hover:border-profile-accent/40 hover:text-white"
      >
        {copied ? (
          <Check size={16} className="text-brand-green" />
        ) : (
          <Copy size={16} />
        )}
        <span className="hidden sm:inline">
          {copied ? "Copied" : "Copy link"}
        </span>
      </button>
    </div>
  );
}

export default ProfileActions;
