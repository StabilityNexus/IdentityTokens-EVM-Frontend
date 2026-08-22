export type AvatarGlyph =
  | "hexagon"
  | "cube"
  | "orbit"
  | "prism"
  | "shard"
  | "nodes"
  | "pulse"
  | "core";

export interface AvatarPreset {
  /** Stable id persisted with the profile — never renumber these. */
  id: string;
  /** Shown as the tooltip / aria-label in the picker. */
  label: string;
  /** Gradient start colour. */
  from: string;
  /** Gradient end colour. */
  to: string;
  glyph: AvatarGlyph;
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  {
    id: "a01",
    label: "Violet Hex",
    from: "#a78bfa",
    to: "#4c1d95",
    glyph: "hexagon",
  },
  {
    id: "a02",
    label: "Cyan Cube",
    from: "#67e8f9",
    to: "#0e5aa7",
    glyph: "cube",
  },
  {
    id: "a03",
    label: "Mint Orbit",
    from: "#63fc9f",
    to: "#0f766e",
    glyph: "orbit",
  },
  {
    id: "a04",
    label: "Amber Prism",
    from: "#fcd34d",
    to: "#c2410c",
    glyph: "prism",
  },
  {
    id: "a05",
    label: "Rose Shard",
    from: "#fda4af",
    to: "#9f1239",
    glyph: "shard",
  },
  {
    id: "a06",
    label: "Lime Nodes",
    from: "#bef264",
    to: "#15803d",
    glyph: "nodes",
  },
  {
    id: "a07",
    label: "Sky Pulse",
    from: "#7dd3fc",
    to: "#5b21b6",
    glyph: "pulse",
  },
  {
    id: "a08",
    label: "Fuchsia Core",
    from: "#f0abfc",
    to: "#701a75",
    glyph: "core",
  },
  {
    id: "a09",
    label: "Ember Hex",
    from: "#fdba74",
    to: "#9f1239",
    glyph: "hexagon",
  },
  {
    id: "a10",
    label: "Teal Cube",
    from: "#5eead4",
    to: "#0e7490",
    glyph: "cube",
  },
  {
    id: "a11",
    label: "Indigo Orbit",
    from: "#a5b4fc",
    to: "#1e1b4b",
    glyph: "orbit",
  },
  {
    id: "a12",
    label: "Emerald Prism",
    from: "#6ee7b7",
    to: "#065f46",
    glyph: "prism",
  },
  {
    id: "a13",
    label: "Crimson Shard",
    from: "#fca5a5",
    to: "#7f1d1d",
    glyph: "shard",
  },
  {
    id: "a14",
    label: "Cobalt Nodes",
    from: "#93c5fd",
    to: "#1e3a8a",
    glyph: "nodes",
  },
  {
    id: "a15",
    label: "Plum Pulse",
    from: "#d8b4fe",
    to: "#581c87",
    glyph: "pulse",
  },
  {
    id: "a16",
    label: "Steel Core",
    from: "#cbd5e1",
    to: "#0f172a",
    glyph: "core",
  },
] as const;

export const DEFAULT_AVATAR_ID = AVATAR_PRESETS[0].id;

/** Look up a preset, falling back to a deterministic one for unknown ids. */
export function getAvatarPreset(id: string | null | undefined): AvatarPreset {
  if (id) {
    const found = AVATAR_PRESETS.find((a) => a.id === id);
    if (found) return found;
  }
  return AVATAR_PRESETS[0];
}

/** Pick a random preset id, optionally guaranteeing it differs from `exclude`. */
export function getRandomAvatarId(exclude?: string | null): string {
  const pool = exclude
    ? AVATAR_PRESETS.filter((a) => a.id !== exclude)
    : AVATAR_PRESETS;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export function deriveAvatarId(seed: string | null | undefined): string {
  if (!seed) return DEFAULT_AVATAR_ID;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return AVATAR_PRESETS[Math.abs(hash) % AVATAR_PRESETS.length].id;
}
