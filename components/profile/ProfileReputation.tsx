"use client";

import React, { useId } from "react";
import { ProfileCard } from "./ProfileCard";

interface ProfileReputationProps {
  trustScore: number;
  totalAttestations: number;
  /** Omit to render the headline figure as static text. */
  onViewAttesters?: () => void;
  className?: string;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileReputation({
  trustScore,
  totalAttestations,
  onViewAttesters,
  className,
}: ProfileReputationProps) {
  const uid = useId().replace(/:/g, "");
  const score = Math.max(0, Math.min(100, Math.round(trustScore)));
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <ProfileCard title="Reputation" className={className}>
      <div className="flex flex-col items-center gap-5">
        {/* Trust score ring */}
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id={`trust-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-profile-accent)" />
                <stop
                  offset="100%"
                  stopColor="var(--color-profile-accent-alt)"
                />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--color-profile-border)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={`url(#trust-${uid})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-utsaha text-3xl text-white">{score}</span>
            <span className="font-utsaha text-[11px] tracking-wide text-profile-muted uppercase">
              Trust score
            </span>
          </div>
        </div>

        {/* Headline figure — doubles as the way into the attester list */}
        {(() => {
          const figure = (
            <>
              <p className="text-gradient-profile font-utsaha text-3xl">
                {totalAttestations}
              </p>
              <p className="mt-0.5 font-utsaha text-xs text-profile-muted">
                Total attestation{totalAttestations === 1 ? "" : "s"} received
              </p>
            </>
          );
          const shell =
            "w-full rounded-xl border border-profile-border bg-profile-surface-raised px-4 py-3.5 text-center";

          return onViewAttesters ? (
            <button
              type="button"
              onClick={onViewAttesters}
              className={`${shell} transition-colors hover:border-profile-accent/45`}
            >
              {figure}
              <span className="mt-1 block font-utsaha text-[11px] text-profile-accent-soft">
                View attesters
              </span>
            </button>
          ) : (
            <div className={shell}>{figure}</div>
          );
        })()}
      </div>
    </ProfileCard>
  );
}

export default ProfileReputation;
