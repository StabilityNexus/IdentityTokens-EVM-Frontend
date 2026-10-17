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
  /** On-chain index of a saved link; a new row has a negative key instead. */
  index: number;
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
  index: number;
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

/** A row without a URL is an empty link, whatever its label says. */
function normalizeLink(link: { label: string; url: string }): ProfileLink {
  const url = link.url.trim();
  return url ? { label: link.label.trim(), url } : EMPTY_LINK;
}

/** Editor rows for the saved links, in index order; gaps are skipped. */
export function linksFromChain(links: readonly ProfileLink[]): CustomLink[] {
  return links.flatMap((link, index) =>
    link.url ? [{ label: link.label, url: link.url, index }] : []
  );
}

/** A key for a newly added row: negative, so it never matches a saved index. */
export function nextLinkKey(rows: readonly CustomLink[]): number {
  return Math.min(0, ...rows.map((row) => row.index)) - 1;
}

/**
 * Writes for the indexes whose link differs from the chain. Saved rows keep
 * their index; new rows fill the lowest free ones in the order they were
 * added (gaps and removed links first, then the end), so appends stay
 * contiguous as the contract requires. Against `[]` (a new profile) that is
 * the filled rows at 0, 1, 2…
 */
export function diffLinks(
  chainLinks: readonly ProfileLink[],
  rows: readonly CustomLink[]
): LinkUpdate[] {
  const saved = chainLinks.length;
  const wanted = new Map<number, ProfileLink>();
  const added: ProfileLink[] = [];
  for (const row of rows) {
    const link = normalizeLink(row);
    if (!link.url) continue;
    if (row.index >= 0 && row.index < saved) wanted.set(row.index, link);
    else added.push(link);
  }

  let free = 0;
  for (const link of added) {
    while (wanted.has(free)) free++;
    wanted.set(free, link);
  }

  const end = Math.max(saved, ...[...wanted.keys()].map((index) => index + 1));
  const links: LinkUpdate[] = [];
  for (let index = 0; index < end; index++) {
    const next = wanted.get(index) ?? EMPTY_LINK;
    const current = chainLinks[index] ?? EMPTY_LINK;
    if (next.label !== current.label || next.url !== current.url) {
      links.push({ index, ...next });
    }
  }
  return links;
}

/**
 * Only the fields and links of `next` / `rows` that differ from what is
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
