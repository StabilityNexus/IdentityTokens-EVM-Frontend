// Mirrors IdentitySystem.sol ids; no runtime imports so check:tokenid can load it

/** Must equal `IdentitySystem.SERIAL_SPACE`, `MIX` and `SALT`. */
const SERIAL_SPACE = 10_000_000_000n;
const MIX = 6_180_339_887n;
const SALT = 3_141_592_653n;

/** Indexed by on-chain `TokenType` (ROOT, SUB, PROFILE). */
const PREFIXES = ["id", "tk", "pf"] as const;

export type TokenTypeNum = 0 | 1 | 2;

const TOKEN_ID = /^(id|tk|pf)-(\d{10})$/;

/** ROOT = 0, SUB = 1, PROFILE = 2; undefined if the id carries no type. */
export function tokenTypeOf(id: bigint): TokenTypeNum | undefined {
  const tag = id / SERIAL_SPACE;
  return tag >= 1n && tag <= 3n
    ? ((Number(tag) - 1) as TokenTypeNum)
    : undefined;
}

/** 20901699435n → "tk-0901699435" */
export function formatTokenId(id: bigint): string {
  const type = tokenTypeOf(id);
  if (type === undefined) return id.toString();
  const digits = (id % SERIAL_SPACE).toString().padStart(10, "0");
  return `${PREFIXES[type]}-${digits}`;
}

/** Exact inverse of `formatTokenId`: a prefix plus all 10 digits, or undefined. */
export function parseTokenId(input: string): bigint | undefined {
  const match = TOKEN_ID.exec(input.trim().toLowerCase());
  if (!match) return undefined;
  const type = PREFIXES.indexOf(match[1] as (typeof PREFIXES)[number]);
  return BigInt(type + 1) * SERIAL_SPACE + BigInt(match[2]);
}

/** Id of the `serial`-th mint of `type` (same formula as `_nextId`). */
export function tokenIdFor(type: TokenTypeNum, serial: bigint): bigint {
  const t = BigInt(type);
  return (t + 1n) * SERIAL_SPACE + ((serial * MIX + t * SALT) % SERIAL_SPACE);
}
