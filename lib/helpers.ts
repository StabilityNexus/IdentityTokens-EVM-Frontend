import { maxUint256 } from "viem";
import { TokenAttester, TokenListVariant, TokenCardVariant } from "@/lib/types";
import { Attestation } from "@/lib/types.responses";

/**
 * Duration sent to `attestToken` for an attestation that never expires. The
 * contract stores `block.timestamp + duration`, so half of uint256 can't
 * overflow, and no real date reaches it.
 */
export const NO_EXPIRY_DURATION = maxUint256 / 2n;

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
  if (validUntil === 0n || validUntil >= NO_EXPIRY_DURATION) return "Never";
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
 * How long an attestation was given for, in the units the attest presets use.
 * The contract cuts it short at the token's own expiry, so this is the real span.
 */
export function formatAttestationLength({
  timestamp,
  expiresAt,
}: Attestation): string {
  if (expiresAt >= NO_EXPIRY_DURATION) return "No expiration";
  const days = Number((expiresAt - timestamp) / 86400n);
  if (days < 1) return "< 1 day";
  if (days < 365) return `${days} ${days === 1 ? "day" : "days"}`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"}`;
}

export type AttestationStatus = "active" | "revoked" | "expired";

/** Where an attestation stands, by the viewer's clock. */
export function attestationStatus({
  revokedAt,
  expiresAt,
}: Attestation): AttestationStatus {
  if (revokedAt > 0n) return "revoked";
  if (expiresAt <= BigInt(Math.floor(Date.now() / 1000))) return "expired";
  return "active";
}

/** How many different identities hold an active attestation in the list. */
export function countActiveAttesters(attesters: TokenAttester[]): number {
  return new Set(
    attesters
      .filter((a) => attestationStatus(a.attestation) === "active")
      .map((a) => a.attestation.attesterTokenId)
  ).size;
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
    case "discover":
      return "discover";
  }
}

export function getSectionTitle(listVariant: TokenListVariant): string {
  switch (listVariant) {
    case "tokens":
      return "Your Tokens";
    case "discover":
      return "Discover";
  }
}
