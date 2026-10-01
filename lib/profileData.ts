/**
 * Profile form ↔ on-chain data.
 *
 * Owns the single normalisation step that both create and edit use, so a
 * value read back from the chain compares equal to what the form would write.
 * That is what lets the edit diff send only the fields and link slots that
 * really changed — the contract rewrites nothing else, which is the fee saving.
 *
 * Keep this file free of runtime imports (type imports are fine) so
 * `node scripts/check-profile-diff.mjs` can load it directly.
 */
import type { ProfileLink, ProfileMetadata } from "./types.responses";

/** Must equal `ProfileSystem.MAX_LINKS`. */
export const MAX_CUSTOM_LINKS = 6;
export const MAX_LINK_LABEL_LENGTH = 24;
export const MAX_LINK_URL_LENGTH = 200;

/** Mirrors the on-chain `DataTypes.ProfileField` enum — the order must match. */
export const PROFILE_FIELD = {
  NAME: 0,
  NATIONALITY: 1,
  GITHUB: 2,
  EMAIL: 3,
  DISCORD: 4,
  X_DOT_COM: 5,
  WEBSITE: 6,
  ENS: 7,
  AVATAR: 8,
} as const;

export interface CustomLink {
  /** Display name, e.g. "Farcaster". */
  label: string;
  /** Absolute URL including protocol. */
  url: string;
  /**
   * On-chain slot. It stays put when other rows are removed, so removing one
   * link rewrites one slot instead of shifting every link after it.
   */
  slot: number;
}

export interface ProfileFormData {
  name: string;
  username: string;
  nationality: string;
  github: string;
  email: string;
  discord: string;
  xDotCom: string;
  website: string;
  ens: string;
}

export const EMPTY_PROFILE_FORM: ProfileFormData = {
  name: "",
  username: "",
  nationality: "",
  github: "",
  email: "",
  discord: "",
  xDotCom: "",
  website: "",
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

/** Every field the contract lets an owner edit. Username is permanent. */
const EDITABLE_FIELDS: readonly [
  number,
  Exclude<keyof ProfileMetadata, "username">,
][] = [
  [PROFILE_FIELD.NAME, "name"],
  [PROFILE_FIELD.NATIONALITY, "nationality"],
  [PROFILE_FIELD.GITHUB, "github"],
  [PROFILE_FIELD.EMAIL, "email"],
  [PROFILE_FIELD.DISCORD, "discord"],
  [PROFILE_FIELD.X_DOT_COM, "xDotCom"],
  [PROFILE_FIELD.WEBSITE, "websitePortfolioLink"],
  [PROFILE_FIELD.ENS, "ens"],
  [PROFILE_FIELD.AVATAR, "avatarId"],
];

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
    websitePortfolioLink: normalizeWebsite(form.website),
    ens: form.ens.trim(),
    avatarId,
  };
}

/** Form values for an existing profile — the inverse of `normalizeProfile`. */
export function profileToForm(profile: ProfileMetadata): ProfileFormData {
  return {
    name: profile.name,
    username: profile.username,
    nationality: profile.nationality,
    github: profile.github,
    email: profile.email,
    discord: profile.discord,
    xDotCom: profile.xDotCom,
    website: profile.websitePortfolioLink,
    ens: profile.ens,
  };
}

/** A row without a URL is an empty slot, whatever its label says. */
function normalizeLink(link: { label: string; url: string }): ProfileLink {
  const url = link.url.trim().slice(0, MAX_LINK_URL_LENGTH);
  if (!url) return EMPTY_LINK;
  return { label: link.label.trim().slice(0, MAX_LINK_LABEL_LENGTH), url };
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

/** Link writes for a brand-new profile: every filled row. */
export function toLinkUpdates(rows: readonly CustomLink[]): LinkUpdate[] {
  return rows
    .map((row) => ({ slot: row.slot, ...normalizeLink(row) }))
    .filter((link) => link.url);
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
  const fields = EDITABLE_FIELDS.filter(
    ([, key]) => next[key] !== chain[key]
  ).map(([field, key]) => ({ field, value: next[key] }));

  const links: LinkUpdate[] = [];
  for (let slot = 0; slot < MAX_CUSTOM_LINKS; slot++) {
    const row = rows.find((candidate) => candidate.slot === slot);
    const wanted = row ? normalizeLink(row) : EMPTY_LINK;
    const current = chainLinks[slot] ?? EMPTY_LINK;
    if (wanted.label !== current.label || wanted.url !== current.url) {
      links.push({ slot, ...wanted });
    }
  }

  return { fields, links };
}
