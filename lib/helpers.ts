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
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months`;
  return `${Math.floor(diff / 31536000)} years`;
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
