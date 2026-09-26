// Card artwork geometry, shared by the live SVG card and the canvas share image.

/** One silk line in the wave layer, in `WAVE_VIEWBOX` units. */
export interface WaveLine {
  y: number;
  amp: number;
  phase: number;
  opacity: number;
  width: number;
}

/** The wave layer is twice as wide as it repeats, so it can loop seamlessly. */
export const WAVE_VIEWBOX = { width: 1200, height: 400 } as const;
const WAVE_PERIOD = WAVE_VIEWBOX.width / 2;

export const WAVE_LINES: readonly WaveLine[] = Array.from(
  { length: 14 },
  (_, i) => ({
    y: 24 + i * 27,
    amp: 16 + Math.sin(i * 0.7) * 9 + i * 1.4,
    phase: i * 36,
    opacity: 0.05 + ((i * 7) % 5) * 0.024,
    width: 1.1 + ((i * 3) % 4) * 0.45,
  })
);

/** Height of a wave line at `x`; periodic in `WAVE_PERIOD`. */
export function waveY(line: WaveLine, x: number): number {
  const t = ((x + line.phase) / WAVE_PERIOD) * Math.PI * 2;
  return (
    line.y +
    line.amp * Math.sin(t) +
    line.amp * 0.35 * Math.sin(t * 2 + line.phase / 90)
  );
}

export function wavePath(line: WaveLine, step = 12): string {
  const parts: string[] = [];
  for (let x = 0; x <= WAVE_VIEWBOX.width; x += step) {
    parts.push(`${x === 0 ? "M" : "L"}${x} ${waveY(line, x).toFixed(1)}`);
  }
  return parts.join("");
}
