/**
 * Profile form ↔ on-chain data.
 *
 * Create and edit share one normalisation step, so a value read back from the
 * chain compares equal to what the form would write and the edit diff sends
 * only what really changed.
 *
 * Keep this file free of runtime imports (type imports are fine) so
 * `npm run check:profile` can load it directly.
 */
import type { ProfileLink, ProfileMetadata } from "./types.responses";

/** Must equal `ProfileSystem.MAX_LINKS`. */
export const MAX_CUSTOM_LINKS = 6;
export const MAX_LINK_LABEL_LENGTH = 24;
export const MAX_LINK_URL_LENGTH = 200;

/**
 * Every field an owner can edit, in on-chain `DataTypes.ProfileField` order:
 * a key's index is its enum value. Username is permanent, so it is absent.
 */
export const EDITABLE_FIELDS = [
  "name",
  "nationality",
  "github",
  "email",
  "discord",
  "xDotCom",
  "websitePortfolioLink",
  "ens",
  "avatarId",
] as const satisfies readonly (keyof ProfileMetadata)[];

export interface CustomLink {
  /** Display name, e.g. "Farcaster". */
  label: string;
  /** Absolute URL including protocol. */
  url: string;
  /** On-chain slot; it stays put when other rows are removed. */
  slot: number;
}

/** The avatar is picked separately, so the form holds everything else. */
export type ProfileFormData = Omit<ProfileMetadata, "avatarId">;

export const EMPTY_PROFILE_FORM: ProfileFormData = {
  name: "",
  username: "",
  nationality: "",
  github: "",
  email: "",
  discord: "",
  xDotCom: "",
  websitePortfolioLink: "",
  ens: "",
};

/** Argument shapes of `ProfileSystem.updateProfile` / `createProfile`. */
export interface FieldUpdate {
  field: number;
  value: string;
}

export interface LinkUpdate {
  slot: number;
  label: string;
  url: string;
}

const EMPTY_LINK: ProfileLink = { label: "", url: "" };

/** Normalise a website for storage — guarantees a protocol is present. */
export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** The exact metadata the contract stores for this form. */
export function normalizeProfile(
  form: ProfileFormData,
  avatarId: string
): ProfileMetadata {
  return {
    name: form.name.trim(),
    username: form.username.trim(),
    nationality: form.nationality,
    github: form.github.trim(),
    email: form.email.trim(),
    discord: form.discord.trim(),
    xDotCom: form.xDotCom.trim().replace(/^@/, ""),
    websitePortfolioLink: normalizeWebsite(form.websitePortfolioLink),
    ens: form.ens.trim(),
    avatarId,
  };
}

/** A row without a URL is an empty slot, whatever its label says. */
function normalizeLink(link: { label: string; url: string }): ProfileLink {
  const url = link.url.trim();
  return url ? { label: link.label.trim(), url } : EMPTY_LINK;
}

/** Editor rows for the filled on-chain slots, in slot order. */
export function linksFromChain(slots: readonly ProfileLink[]): CustomLink[] {
  return slots.flatMap((link, slot) =>
    link.url ? [{ label: link.label, url: link.url, slot }] : []
  );
}

/** The lowest slot no row uses, or undefined when every slot is taken. */
export function nextFreeSlot(rows: readonly CustomLink[]): number | undefined {
  for (let slot = 0; slot < MAX_CUSTOM_LINKS; slot++) {
    if (!rows.some((row) => row.slot === slot)) return slot;
  }
  return undefined;
}

/**
 * Writes for the slots whose row differs from the chain. Against `[]` (a new
 * profile) that is exactly the filled rows.
 */
export function diffLinks(
  chainLinks: readonly ProfileLink[],
  rows: readonly CustomLink[]
): LinkUpdate[] {
  const links: LinkUpdate[] = [];
  for (let slot = 0; slot < MAX_CUSTOM_LINKS; slot++) {
    const row = rows.find((candidate) => candidate.slot === slot);
    const wanted = row ? normalizeLink(row) : EMPTY_LINK;
    const current = chainLinks[slot] ?? EMPTY_LINK;
    if (wanted.label !== current.label || wanted.url !== current.url) {
      links.push({ slot, ...wanted });
    }
  }
  return links;
}

/**
 * Only the fields and link slots of `next` / `rows` that differ from what is
 * on-chain. An empty result means there is nothing to save.
 */
export function diffProfile(
  chain: ProfileMetadata,
  chainLinks: readonly ProfileLink[],
  next: ProfileMetadata,
  rows: readonly CustomLink[]
): { fields: FieldUpdate[]; links: LinkUpdate[] } {
  const fields = EDITABLE_FIELDS.flatMap((key, field) =>
    next[key] !== chain[key] ? [{ field, value: next[key] }] : []
  );
  return { fields, links: diffLinks(chainLinks, rows) };
}
