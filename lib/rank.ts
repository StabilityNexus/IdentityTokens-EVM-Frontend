import { RankName } from "./types";

export const RANK_THRESHOLDS: readonly { max: number; rank: RankName }[] = [
  { max: 10, rank: "bronze" },
  { max: 50, rank: "silver" },
  { max: 100, rank: "gold" },
  { max: 500, rank: "platinum" },
  { max: 1000, rank: "diamond" },
] as const;

/** Human-facing copy for each rank, used under the badge on a profile. */
export const RANK_LABELS: Record<RankName, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
  champion: "Champion",
};

/**
 * Trust score on a 0-100 scale: two points per attestation, on top of a
 * baseline. Callers own the baseline because they differ on when it is earned --
 * a public profile always carries it, the dashboard grants it only once a
 * profile exists.
 */
export function getTrustScore(attestations: number, baseline = 20): number {
  return Math.min(100, Math.floor(attestations * 2 + baseline));
}

/** Resolve the badge rank earned for a given number of attestations. */
export function getRankFromAttesters(count: number): RankName {
  for (const { max, rank } of RANK_THRESHOLDS) {
    if (count < max) return rank;
  }
  return "champion";
}

/**
 * Attestations still needed to reach the next rank.
 * Returns `null` once the profile has reached `champion`.
 */
export function getNextRankProgress(
  count: number
): { next: RankName; remaining: number; progress: number } | null {
  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    const { max } = RANK_THRESHOLDS[i];
    if (count < max) {
      const floor = i === 0 ? 0 : RANK_THRESHOLDS[i - 1].max;
      const next =
        i === RANK_THRESHOLDS.length - 1
          ? "champion"
          : RANK_THRESHOLDS[i + 1].rank;
      return {
        next,
        remaining: max - count,
        progress: (count - floor) / (max - floor),
      };
    }
  }
  return null;
}
