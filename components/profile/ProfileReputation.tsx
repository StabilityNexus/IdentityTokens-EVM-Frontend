"use client";

import React, { useId } from "react";
import Badge from "@/components/Badge";
import { ProfileCard } from "./ProfileCard";
import { getNextRankProgress, RANK_LABELS } from "@/lib/rank";
import { RankName } from "@/lib/types";

interface ProfileReputationProps {
  trustScore: number;
  totalEndorsements: number;
  rank: RankName;
  className?: string;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProfileReputation({
  trustScore,
  totalEndorsements,
  rank,
  className,
}: ProfileReputationProps) {
  const uid = useId().replace(/:/g, "");
  const score = Math.max(0, Math.min(100, Math.round(trustScore)));
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);
  const progress = getNextRankProgress(totalEndorsements);

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

        {/* Headline figure */}
        <div className="w-full rounded-xl border border-profile-border bg-profile-surface-raised px-4 py-3.5 text-center">
          <p className="text-gradient-profile font-utsaha text-3xl">
            {totalEndorsements}
          </p>
          <p className="mt-0.5 font-utsaha text-xs text-profile-muted">
            Total endorsement{totalEndorsements === 1 ? "" : "s"} received
          </p>
        </div>

        {/* Badge + progress toward the next rank */}
        <div className="flex w-full items-center gap-3 border-t border-profile-border pt-4">
          <Badge rank={rank} size={44} />
          <div className="min-w-0 flex-1">
            <p className="font-utsaha text-sm text-white">
              {RANK_LABELS[rank]}
            </p>
            {progress ? (
              <>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-profile-border">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-profile-accent to-profile-accent-alt transition-[width] duration-700"
                    style={{ width: `${Math.round(progress.progress * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 font-utsaha text-xs text-profile-muted">
                  {progress.remaining} more to reach{" "}
                  {RANK_LABELS[progress.next]}
                </p>
              </>
            ) : (
              <p className="mt-1 font-utsaha text-xs text-profile-muted">
                Highest rank achieved.
              </p>
            )}
          </div>
        </div>
      </div>
    </ProfileCard>
  );
}

export default ProfileReputation;
