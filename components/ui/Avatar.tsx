"use client";

import React, { useId } from "react";
import {
  AvatarGlyph,
  deriveAvatarId,
  getAvatarPreset,
} from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarProps {
  /** Chosen preset id. Falls back to a value derived from `seed`. */
  avatarId?: string | null;
  /** Wallet address or username — gives pre-avatar profiles a stable look. */
  seed?: string | null;
  /** Pixel size. Omit to fill the parent element instead. */
  size?: number;
  /** `squircle` matches the card language; `full` is a classic round avatar. */
  shape?: "full" | "squircle";
  className?: string;
}

/**
 * Renders one of the built-in avatar presets as inline SVG.
 *
 * Everything is drawn locally — no avatar service, no IPFS gateway, no image
 * request — so avatars render instantly and work offline.
 */
export function Avatar({
  avatarId,
  seed,
  size,
  shape = "squircle",
  className,
}: AvatarProps) {
  // Gradient ids must be unique per instance or multiple avatars on the same
  // page would all resolve to whichever `<defs>` mounted first.
  const uid = useId().replace(/:/g, "");
  const preset = getAvatarPreset(avatarId ?? deriveAvatarId(seed));
  const radius = shape === "full" ? 50 : 26;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size ?? "100%"}
      height={size ?? "100%"}
      role="img"
      aria-label={`${preset.label} avatar`}
      className={cn("shrink-0 select-none", className)}
    >
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={preset.from} />
          <stop offset="100%" stopColor={preset.to} />
        </linearGradient>
        <radialGradient id={`s-${uid}`} cx="0.3" cy="0.22" r="0.85">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="100" height="100" rx={radius} fill={`url(#g-${uid})`} />
      <rect width="100" height="100" rx={radius} fill={`url(#s-${uid})`} />

      <g
        stroke="#fff"
        fill="none"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
      >
        {GLYPHS[preset.glyph]}
      </g>
    </svg>
  );
}

/** Glyph geometry, drawn centred on a 100×100 canvas. */
const GLYPHS: Record<AvatarGlyph, React.ReactNode> = {
  hexagon: (
    <>
      <path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" />
      <path d="M50 35 L63 43 L63 57 L50 65 L37 57 L37 43 Z" opacity={0.55} />
    </>
  ),
  cube: (
    <>
      <path d="M50 22 L76 37 L50 52 L24 37 Z" />
      <path d="M24 37 L50 52 L50 80 L24 65 Z" opacity={0.75} />
      <path d="M76 37 L76 65 L50 80 L50 52 Z" opacity={0.5} />
    </>
  ),
  orbit: (
    <>
      <circle cx="50" cy="50" r="11" fill="#fff" stroke="none" />
      <ellipse
        cx="50"
        cy="50"
        rx="30"
        ry="12"
        transform="rotate(-32 50 50)"
        opacity={0.85}
      />
      <ellipse
        cx="50"
        cy="50"
        rx="30"
        ry="12"
        transform="rotate(32 50 50)"
        opacity={0.55}
      />
    </>
  ),
  prism: (
    <>
      <path d="M50 21 L78 72 L22 72 Z" />
      <path d="M50 21 L50 72" opacity={0.5} />
      <path d="M36 47 L64 47" opacity={0.5} />
    </>
  ),
  shard: (
    <>
      <path d="M50 18 L72 40 L62 79 L38 79 L28 40 Z" />
      <path d="M50 18 L50 79" opacity={0.45} />
      <path d="M28 40 L72 40" opacity={0.45} />
    </>
  ),
  nodes: (
    <>
      <path d="M50 50 L30 32 M50 50 L70 32 M50 50 L30 68 M50 50 L70 68" opacity={0.7} />
      <circle cx="50" cy="50" r="8" fill="#fff" stroke="none" />
      <circle cx="30" cy="32" r="6" fill="#fff" stroke="none" opacity={0.9} />
      <circle cx="70" cy="32" r="6" fill="#fff" stroke="none" opacity={0.9} />
      <circle cx="30" cy="68" r="6" fill="#fff" stroke="none" opacity={0.9} />
      <circle cx="70" cy="68" r="6" fill="#fff" stroke="none" opacity={0.9} />
    </>
  ),
  pulse: (
    <>
      <path d="M16 50 L34 50 L42 28 L56 72 L64 50 L84 50" />
      <circle cx="84" cy="50" r="5" fill="#fff" stroke="none" />
    </>
  ),
  core: (
    <>
      <circle cx="50" cy="50" r="28" opacity={0.55} />
      <circle cx="50" cy="50" r="18" opacity={0.85} />
      <circle cx="50" cy="50" r="7" fill="#fff" stroke="none" />
    </>
  ),
};

export default Avatar;