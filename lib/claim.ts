import { sepolia } from "wagmi/chains";

/** Chain every /claim read and reservation is pinned to. */
export const CLAIM_CHAIN = sepolia;

/** Shown on the card until the visitor types something. */
export const USERNAME_PLACEHOLDER = "yourname";

/** Public faucet linked when the wallet has no Sepolia ETH for gas. */
export const SEPOLIA_FAUCET_URL =
  "https://cloud.google.com/application/web3/faucet/ethereum/sepolia";

/** Drops a leading `@` and lowercases; anything else is left for validation. */
export function normalizeUsernameInput(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

/** Username size in `cqw` for a handle of `length` characters. */
export function usernameSize(length: number): number {
  return Math.max(3.6, Math.min(10, 130 / Math.max(length, 9)));
}

/** "SEPTEMBER / 2026" — the issue date printed on the card. */
export function formatCardDate(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${month.toUpperCase()} / ${date.getFullYear()}`;
}
