/**
 * Profile "extras" codec — avatar choice and custom social links.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 * The on-chain `DataTypes.ProfileMetadata` struct is fixed at ten fields and
 * has no slot for an avatar or for user-defined links. Rather than block the
 * feature on a contract redeploy, both are packed into the free-text
 * `websitePortfolioLink` field behind a URL fragment:
 *
 *     https://mysite.com#dit=eyJ2IjoxLCJhIjoiYTA3Iiwi...
 *     └──── real link ────┘└──────── encoded extras ────────┘
 *
 * Because the payload lives in a fragment it is inert — the visible link still
 * resolves correctly if anything renders the raw string.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHEN THE CONTRACT GAINS REAL FIELDS
 * This file is the only place that needs to change. Point `encodeProfileExtras`
 * / `decodeProfileExtras` at the new struct members and delete the packing —
 * every call site already speaks in terms of `ProfileExtras`.
 */

export interface CustomLink {
  /** Display name, e.g. "Farcaster". */
  label: string;
  /** Absolute URL including protocol. */
  url: string;
}

export interface ProfileExtras {
  avatarId: string | null;
  customLinks: CustomLink[];
}

export interface DecodedProfileLink extends ProfileExtras {
  /** The user-facing website with the encoded payload stripped off. */
  website: string;
}

/** Fragment marker that separates the real link from the encoded payload. */
const MARKER = "#dit=";

/** Payload schema version, so future changes can migrate rather than break. */
const SCHEMA_VERSION = 1;

export const MAX_CUSTOM_LINKS = 6;
export const MAX_LINK_LABEL_LENGTH = 24;
export const MAX_LINK_URL_LENGTH = 200;

/** Compact on-chain shape — short keys keep calldata (and therefore gas) down. */
interface EncodedPayload {
  v: number;
  a?: string;
  l?: { n: string; u: string }[];
}

function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(text: string): string {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Pack a website plus extras into the single string the contract accepts.
 * Returns just the website when there is nothing extra to store, so profiles
 * without an avatar or custom links stay byte-identical to the old format.
 */
export function encodeProfileExtras(
  website: string,
  extras: ProfileExtras
): string {
  const cleanWebsite = website.trim();
  const links = extras.customLinks
    .filter((link) => link.label.trim() && link.url.trim())
    .slice(0, MAX_CUSTOM_LINKS)
    .map((link) => ({
      n: link.label.trim().slice(0, MAX_LINK_LABEL_LENGTH),
      u: link.url.trim().slice(0, MAX_LINK_URL_LENGTH),
    }));

  if (!extras.avatarId && links.length === 0) return cleanWebsite;

  const payload: EncodedPayload = { v: SCHEMA_VERSION };
  if (extras.avatarId) payload.a = extras.avatarId;
  if (links.length > 0) payload.l = links;

  return `${cleanWebsite}${MARKER}${encodeBase64Url(JSON.stringify(payload))}`;
}

/**
 * Split a stored `websitePortfolioLink` back into its website and extras.
 * Any malformed payload degrades to "no extras" rather than throwing, so a
 * corrupt profile still renders.
 */
export function decodeProfileExtras(
  raw: string | null | undefined
): DecodedProfileLink {
  const empty: DecodedProfileLink = {
    website: "",
    avatarId: null,
    customLinks: [],
  };
  if (!raw) return empty;

  const markerIndex = raw.lastIndexOf(MARKER);
  if (markerIndex === -1) return { ...empty, website: raw };

  const website = raw.slice(0, markerIndex);
  const encoded = raw.slice(markerIndex + MARKER.length);

  try {
    const payload = JSON.parse(decodeBase64Url(encoded)) as EncodedPayload;
    return {
      website,
      avatarId: typeof payload.a === "string" ? payload.a : null,
      customLinks: Array.isArray(payload.l)
        ? payload.l
            .filter(
              (link): link is { n: string; u: string } =>
                !!link &&
                typeof link.n === "string" &&
                typeof link.u === "string"
            )
            .slice(0, MAX_CUSTOM_LINKS)
            .map((link) => ({ label: link.n, url: link.u }))
        : [],
    };
  } catch {
    // Unparseable payload — keep the website, drop the extras.
    return { ...empty, website };
  }
}
