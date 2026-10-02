import { TokenListVariant, TokenCardVariant } from "@/lib/types";

/**
 * Shorten a wallet address for display, keeping enough of each end to stay
 * recognisable. `lead`/`tail` default to the 6/4 split used across the
 * dashboard; the profile page passes a wider 8/6.
 */
export function truncateAddress(address: string, lead = 6, tail = 4): string {
  if (address.length <= lead + tail) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function formatExpiry(validUntil: bigint): string {
  if (validUntil === 0n) return "Never";
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(validUntil) - now;
  if (diff <= 0) return "Expired";
  if (diff < 86400) return "< 1 day";
  const days = Math.floor(diff / 86400);
  if (diff < 2592000) return `${days} ${days === 1 ? "day" : "days"}`;
  const months = Math.floor(diff / 2592000);
  if (diff < 31536000) return `${months} ${months === 1 ? "month" : "months"}`;
  const years = Math.floor(diff / 31536000);
  return `${years} ${years === 1 ? "year" : "years"}`;
}

/**
 * How long ago a unix timestamp was, in the same coarse buckets as
 * `formatExpiry` so the two read consistently side by side.
 */
export function formatTimeAgo(timestamp: bigint): string {
  if (timestamp === 0n) return "—";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(timestamp);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  if (diff < 2592000) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const months = Math.floor(diff / 2592000);
  if (diff < 31536000)
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  const years = Math.floor(diff / 31536000);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

/** "3 days ago" for the most recent of the given on-chain timestamps. */
export function formatLastUpdated(
  ...timestamps: (bigint | null | undefined)[]
): string {
  const latest = timestamps.reduce<bigint>(
    (max, t) => (t && t > max ? t : max),
    0n
  );
  return formatTimeAgo(latest);
}

export function getCardVariant(
  listVariant: TokenListVariant
): TokenCardVariant {
  switch (listVariant) {
    case "tokens":
      return "home";
    case "history":
      return "history";
    case "discover":
      return "discover";
  }
}

export function getSectionTitle(listVariant: TokenListVariant): string {
  switch (listVariant) {
    case "tokens":
      return "Your Tokens";
    case "history":
      return "Recents";
    case "discover":
      return "Discover";
  }
}

export function getArcColor(score: number): string {
  if (score >= 70) return "var(--color-brand-green)";
  if (score >= 40) return "var(--color-text-warning)";
  return "var(--color-text-error)";
}
