import { WAVE_LINES, WAVE_VIEWBOX, waveY } from "./cardArt";
import { truncateAddress } from "./helpers";
import { CLAIM_CHAIN, usernameSize } from "./claim";

// Draws the ID card to a PNG on canvas; rasterising the DOM is unreliable (Safari).

export interface CardImageOptions {
  username: string;
  walletAddress?: string;
  dateLabel: string;
  /** Printed under the card as the call to action. */
  claimUrl: string;
}

// 16:9 suits attached images on X and LinkedIn.
const WIDTH = 1600;
const HEIGHT = 900;

const CARD_W = 1040;
const CARD_H = Math.round(CARD_W / 1.586);
const CARD_X = (WIDTH - CARD_W) / 2;
const CARD_Y = (HEIGHT - CARD_H) / 2 - 30;

/** One `cqw` of the live card, at this card width. */
const CQ = CARD_W / 100;

/** The live card is designed at up to 520px wide; strokes scale from there. */
const STROKE_SCALE = CARD_W / 520;

type Rgb = [number, number, number];

function readToken(name: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!value) throw new Error(`Missing design token ${name}`);
  return value;
}

/** The next/font family list behind a `--font-*` variable. */
function readFontFamily(name: string): string {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  if (!value) throw new Error(`Missing font variable ${name}`);
  return value;
}

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mix like `color-mix(in srgb, a weight, b)`. */
function mix(a: Rgb, b: Rgb, weight: number): Rgb {
  return [0, 1, 2].map((i) =>
    Math.round(a[i] * weight + b[i] * (1 - weight))
  ) as Rgb;
}

const rgba = ([r, g, b]: Rgb, alpha = 1) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** An elliptical radial gradient, which canvas has no direct form of. */
function fillEllipseGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  stops: [number, string][]
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/** A CSS-style angled linear gradient across a box. */
function angledGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  degrees: number
) {
  const radians = (degrees * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return ctx.createLinearGradient(
    cx - dx * half,
    cy - dy * half,
    cx + dx * half,
    cy + dy * half
  );
}

/** Loads a /public SVG for canvas, minus `foreignObject`s (they taint it). */
async function loadSvg(path: string): Promise<HTMLImageElement> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const response = await fetch(`${basePath}${path}`);
  if (!response.ok) throw new Error(`Could not load ${path}`);

  const doc = new DOMParser().parseFromString(
    await response.text(),
    "image/svg+xml"
  );
  doc.querySelectorAll("foreignObject").forEach((node) => node.remove());
  const markup = new XMLSerializer().serializeToString(doc);
  const url = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml" })
  );

  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Loads the primary face only; next/font's Arial fallback can reject the load. */
async function loadFont(font: string, sample: string): Promise<void> {
  const primary = font.split(",")[0];
  try {
    await document.fonts.load(primary, sample);
  } catch {
    // Drawn in a fallback face instead; not worth failing the image over.
  }
}

/** Letter spacing is recent on canvas; without it the text is just tighter. */
function setTracking(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  colors: { page: Rgb; grid: Rgb }
) {
  ctx.fillStyle = rgba(colors.page);
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Grid, faded out toward the edges like the page behind the live card.
  ctx.save();
  ctx.strokeStyle = rgba(colors.grid, 0.9);
  ctx.lineWidth = 1;
  for (let x = 0.5; x < WIDTH; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0.5; y < HEIGHT; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();

  fillEllipseGlow(ctx, WIDTH / 2, HEIGHT / 2, WIDTH * 0.62, HEIGHT * 0.7, [
    [0, rgba(colors.page, 0)],
    [0.55, rgba(colors.page, 0.4)],
    [1, rgba(colors.page, 1)],
  ]);
}

function drawSurface(
  ctx: CanvasRenderingContext2D,
  colors: { blue: Rgb; cyan: Rgb }
) {
  const x = CARD_X;
  const y = CARD_Y;
  const w = CARD_W;
  const h = CARD_H;

  ctx.fillStyle = rgba(colors.blue);
  ctx.fillRect(x, y, w, h);

  fillEllipseGlow(ctx, x, y, w * 1.2, h * 0.95, [
    [0, rgba(mix(colors.blue, WHITE, 0.62))],
    [0.58, rgba(colors.blue, 0)],
  ]);
  fillEllipseGlow(ctx, x + w, y + h, w * 0.95, h * 0.95, [
    [0, rgba(mix(colors.blue, BLACK, 0.55))],
    [0.62, rgba(colors.blue, 0)],
  ]);
  fillEllipseGlow(ctx, x + w * 0.2, y + h * 0.3, w * 0.4, h * 0.6, [
    [0, rgba(mix(colors.blue, WHITE, 0.38), 0.55)],
    [1, rgba(colors.blue, 0)],
  ]);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  fillEllipseGlow(ctx, x + w * 0.78, y + h * 0.42, w * 0.22, h * 0.35, [
    [0, rgba(colors.cyan, 0.2)],
    [1, rgba(colors.cyan, 0)],
  ]);
  ctx.restore();

  // Waves: the live layer is 140% of the card, rotated -14°.
  ctx.save();
  const layerW = w * 1.4;
  const layerH = h * 1.4;
  const sx = (layerW * 2) / WAVE_VIEWBOX.width;
  const sy = layerH / WAVE_VIEWBOX.height;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.translate(-layerW / 2, -layerH / 2);
  for (const line of WAVE_LINES) {
    ctx.beginPath();
    for (let vx = 0; vx <= WAVE_VIEWBOX.width / 2; vx += 8) {
      const px = vx * sx;
      const py = waveY(line, vx) * sy;
      if (vx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = rgba(WHITE, line.opacity);
    ctx.lineWidth = line.width * STROKE_SCALE;
    ctx.stroke();
  }
  ctx.restore();

  // The lacquer.
  const gloss = angledGradient(ctx, x, y, w, h, 168);
  gloss.addColorStop(0, rgba(WHITE, 0.36));
  gloss.addColorStop(0.3, rgba(WHITE, 0.1));
  gloss.addColorStop(0.46, rgba(WHITE, 0));
  gloss.addColorStop(0.78, rgba(BLACK, 0));
  gloss.addColorStop(1, rgba(BLACK, 0.16));
  ctx.fillStyle = gloss;
  ctx.fillRect(x, y, w, h);
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  options: CardImageOptions,
  fonts: { display: string; hand: string },
  logo: HTMLImageElement
) {
  const pad = 6.5 * CQ;
  const left = CARD_X + pad;
  const right = CARD_X + CARD_W - pad;
  const top = CARD_Y + pad;
  const bottom = CARD_Y + CARD_H - pad;
  const smallCaps = 1.9 * CQ;

  const drawSmallCaps = (text: string, x: number, y: number) => {
    ctx.font = `400 ${smallCaps}px ${fonts.hand}`;
    setTracking(ctx, smallCaps * 0.2);
    ctx.fillStyle = rgba(WHITE, 0.8);
    ctx.fillText(text.toUpperCase(), x, y);
    setTracking(ctx, 0);
  };

  ctx.save();

  // dit mark, top left.
  const logoH = 5.6 * CQ;
  const logoW = logoH * (logo.naturalWidth / logo.naturalHeight);
  const topRowMid = top + logoH / 2;
  ctx.drawImage(logo, left, top, logoW, logoH);
  ctx.font = `700 ${5.2 * CQ}px ${fonts.display}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(WHITE);
  ctx.fillText("dit", left + logoW + 1.3 * CQ, topRowMid);

  // Date, top right, level with the mark.
  ctx.textAlign = "right";
  drawSmallCaps(options.dateLabel, right, topRowMid);

  // Username, bold and centred on the card.
  const handle = `@${options.username}`;
  const maxNameWidth = CARD_W - pad * 2;
  let nameSize = usernameSize(handle.length) * CQ;
  ctx.font = `700 ${nameSize}px ${fonts.hand}`;
  const measured = ctx.measureText(handle).width;
  if (measured > maxNameWidth) {
    nameSize *= maxNameWidth / measured;
    ctx.font = `700 ${nameSize}px ${fonts.hand}`;
  }
  const atWidth = ctx.measureText("@").width;
  const nameX = CARD_X + (CARD_W - ctx.measureText(handle).width) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = rgba(WHITE, 0.7);
  ctx.fillText("@", nameX, CARD_Y + CARD_H / 2);
  ctx.fillStyle = rgba(WHITE);
  ctx.fillText(options.username, nameX + atWidth, CARD_Y + CARD_H / 2);

  // Wallet bottom left, chain bottom right.
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 ${2.4 * CQ}px ${fonts.hand}`;
  ctx.fillStyle = rgba(WHITE, 0.8);
  ctx.fillText(
    options.walletAddress
      ? truncateAddress(options.walletAddress, 6, 4)
      : "0x0000…0000",
    left,
    bottom
  );
  ctx.textAlign = "right";
  drawSmallCaps(CLAIM_CHAIN.name, right, bottom);

  ctx.restore();
}

export async function renderClaimCardImage(
  options: CardImageOptions
): Promise<Blob> {
  const colors = {
    blue: hexToRgb(readToken("--color-brand-blue")),
    cyan: hexToRgb(readToken("--color-profile-accent-alt")),
    page: hexToRgb(readToken("--color-landing-bg-dark")),
    grid: hexToRgb(readToken("--color-corner-stroke-dark")),
  };
  const fonts = {
    display: readFontFamily("--font-atyp"),
    hand: readFontFamily("--font-utsaha"),
  };

  const [logo] = await Promise.all([
    loadSvg("/assets/dark-logo.svg"),
    loadFont(`700 60px ${fonts.display}`, "dit"),
    loadFont(`400 60px ${fonts.hand}`, `@${options.username}0`),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  drawBackdrop(ctx, { page: colors.page, grid: colors.grid });

  const radius = 4.5 * CQ;
  ctx.save();
  roundRectPath(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, radius);
  ctx.clip();
  drawSurface(ctx, { blue: colors.blue, cyan: colors.cyan });
  drawContent(ctx, options, fonts, logo);
  ctx.restore();

  // Glass edge.
  roundRectPath(ctx, CARD_X + 1, CARD_Y + 1, CARD_W - 2, CARD_H - 2, radius);
  ctx.strokeStyle = rgba(WHITE, 0.45);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Call to action under the card.
  const host = options.claimUrl.replace(/^https?:\/\//, "");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 30px ${fonts.hand}`;
  ctx.fillStyle = rgba(WHITE, 0.62);
  ctx.fillText(
    `Claim your username at ${host}`,
    WIDTH / 2,
    (CARD_Y + CARD_H + HEIGHT) / 2 + 14
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not encode image")),
      "image/png"
    );
  });
}
