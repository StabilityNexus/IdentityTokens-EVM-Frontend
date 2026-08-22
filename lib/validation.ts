export type FieldStatus = "idle" | "valid" | "invalid" | "warning" | "checking";

export interface FieldResult {
  status: FieldStatus;
  message?: string;
  /** A corrected value the UI can offer to apply (e.g. handle from a URL). */
  suggestion?: string;
}

const OK: FieldResult = { status: "valid" };
const IDLE: FieldResult = { status: "idle" };

const invalid = (message: string): FieldResult => ({
  status: "invalid",
  message,
});

const warn = (message: string, suggestion?: string): FieldResult => ({
  status: "warning",
  message,
  suggestion,
});

// Handle extraction

/** Profile-URL patterns whose first capture group is the handle. */
const PROFILE_URL_PATTERNS: Record<string, RegExp[]> = {
  github: [/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)/i],
  x: [
    /^(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?#\s]+)/i,
    /^(?:https?:\/\/)?(?:www\.)?twitter\.com\/([^/?#\s]+)/i,
  ],
  discord: [
    /^(?:https?:\/\/)?(?:www\.)?discord(?:app)?\.com\/users\/([^/?#\s]+)/i,
  ],
};

/**
 * Pull a bare handle out of a pasted profile URL.
 * Returns `null` when the value is not a recognisable URL for that platform.
 */
export function extractHandle(
  platform: keyof typeof PROFILE_URL_PATTERNS,
  value: string
): string | null {
  const patterns = PROFILE_URL_PATTERNS[platform];
  if (!patterns) return null;
  for (const pattern of patterns) {
    const match = value.trim().match(pattern);
    if (match?.[1]) return match[1].replace(/^@/, "");
  }
  return null;
}

/** True when the value looks like a URL rather than a handle. */
function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || /\.[a-z]{2,}\//i.test(value);
}

// Social handle validators

/** GitHub: 1–39 chars, alphanumeric or single hyphens, not hyphen-terminated. */
export function validateGithub(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;

  const handle = extractHandle("github", trimmed);
  if (handle) {
    return warn("Enter just your username, not the full URL.", handle);
  }
  if (looksLikeUrl(trimmed)) {
    return invalid("Enter just your GitHub username, not a link.");
  }
  if (trimmed.startsWith("@")) {
    return warn(
      "GitHub usernames are written without the @.",
      trimmed.slice(1)
    );
  }
  if (trimmed.length > 39) {
    return invalid("GitHub usernames are at most 39 characters.");
  }
  if (!/^[A-Za-z0-9-]+$/.test(trimmed)) {
    return invalid("Only letters, numbers and hyphens are allowed.");
  }
  if (/^-|-$/.test(trimmed) || /--/.test(trimmed)) {
    return invalid("Hyphens can't start, end, or repeat.");
  }
  return OK;
}

/** X (Twitter): 1–15 chars, letters, numbers and underscores. */
export function validateX(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;

  const handle = extractHandle("x", trimmed);
  if (handle) {
    return warn("Enter just your handle, not the full URL.", handle);
  }
  if (looksLikeUrl(trimmed)) {
    return invalid("Enter just your X handle, not a link.");
  }

  const bare = trimmed.replace(/^@/, "");
  if (bare !== trimmed) {
    return warn("Drop the @ — we add it for you.", bare);
  }
  if (bare.length > 15) {
    return invalid("X handles are at most 15 characters.");
  }
  if (!/^[A-Za-z0-9_]+$/.test(bare)) {
    return invalid("Only letters, numbers and underscores are allowed.");
  }
  return OK;
}

/** Discord: 2–32 lowercase chars (new format), or the legacy name#0000. */
export function validateDiscord(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;

  const handle = extractHandle("discord", trimmed);
  if (handle) {
    return warn("Enter your username, not the full URL.", handle);
  }
  if (looksLikeUrl(trimmed)) {
    return invalid("Enter just your Discord username, not a link.");
  }
  if (/^.{2,32}#\d{4}$/.test(trimmed)) {
    return { status: "valid", message: "Legacy Discord tag." };
  }
  if (trimmed !== trimmed.toLowerCase()) {
    return warn("Discord usernames are lowercase.", trimmed.toLowerCase());
  }
  if (trimmed.length < 2 || trimmed.length > 32) {
    return invalid("Discord usernames are 2–32 characters.");
  }
  if (!/^[a-z0-9._]+$/.test(trimmed)) {
    return invalid("Only lowercase letters, numbers, dots and underscores.");
  }
  return OK;
}

// Other profile fields

export function validateName(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;
  if (trimmed.length > 64) return invalid("Name is at most 64 characters.");
  return OK;
}

/** Profile username — matches the contract's own character rules. */
export function validateUsername(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;
  if (trimmed.length < 3) return invalid("At least 3 characters.");
  if (trimmed.length > 32) return invalid("At most 32 characters.");
  if (!/^[a-z0-9._]+$/.test(trimmed)) {
    return invalid("Only lowercase letters, numbers, dots and underscores.");
  }
  return OK;
}

export function validateAge(value: string): FieldResult {
  if (!value.trim()) return IDLE;
  const age = Number(value);
  if (!Number.isFinite(age) || !Number.isInteger(age)) {
    return invalid("Enter a whole number.");
  }
  if (age < 13) return invalid("You must be at least 13.");
  if (age > 120) return invalid("Enter a realistic age.");
  return OK;
}

export function validateEmail(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return invalid("Enter a valid email address.");
  }
  return OK;
}

export function validateWebsite(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;
  if (trimmed.includes("#dit=")) {
    return invalid("This link contains a reserved marker.");
  }
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return invalid("Enter a valid URL.");
  } catch {
    return invalid("Enter a valid URL.");
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return warn("Missing protocol — we'll use https.", withProtocol);
  }
  return OK;
}

export function validateEns(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;
  if (trimmed !== trimmed.toLowerCase()) {
    return warn("ENS names are lowercase.", trimmed.toLowerCase());
  }
  if (!/^[a-z0-9-]+\.eth$/.test(trimmed)) {
    return invalid("ENS names look like yourname.eth.");
  }
  return OK;
}

export function validateLinkLabel(value: string): FieldResult {
  const trimmed = value.trim();
  if (!trimmed) return IDLE;
  if (trimmed.length > 24) return invalid("At most 24 characters.");
  return OK;
}

// Aggregate helpers

/** Normalise a website for storage — guarantees a protocol is present. */
export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** A field blocks submission only when it is outright invalid. */
export function blocksSubmit(result: FieldResult): boolean {
  return result.status === "invalid";
}
