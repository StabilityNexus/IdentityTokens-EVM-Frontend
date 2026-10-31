import { truncateAddress } from "./helpers";
import { formatTokenId } from "./tokenId";
import { readKey, writeKey } from "./storage";
import type { TokenAttester } from "./types";

export type NotificationKind =
  | "attested"
  | "revoked"
  | "received"
  | "flagged"
  | "autoFlagged"
  | "attestedMoved"
  | "devFee"
  | "devFeeReceiver"
  | "gap";

/** One row in the bell's panel. Bigints are strings so it round-trips through JSON. */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Unix seconds, chain time */
  at: number;
  tokenId?: string;
  tokenName?: string;
  /** The wallet that acted, or the new receiver for `devFeeReceiver` */
  actor?: string;
  /** The actor's display name, when the chain gives one */
  actorName?: string;
  /** Flag count, or the new devFee */
  value?: string;
}

/** The fields of a decoded IdentitySystem log that are read here. */
export interface ContractLog {
  eventName: string;
  args: Record<string, unknown>;
  blockNumber: bigint;
  /** Only some RPCs include it; otherwise the block is fetched */
  blockTimestamp?: bigint;
  transactionHash: `0x${string}`;
  logIndex: number;
}

/** What the connected wallet holds and attests, to tell which logs concern it. */
export interface WalletContext {
  /** Lowercased connected wallet, if any */
  wallet?: string;
  rootId?: bigint;
  /** Token ids the wallet holds */
  myTokens: ReadonlySet<string>;
  /** Token ids the wallet's identity currently attests */
  attestedTokens: ReadonlySet<string>;
}

type PendingNotification = Omit<AppNotification, "at">;

const lower = (value: unknown) => String(value).toLowerCase();

/**
 * The notification a log makes for this wallet, without its time, or null.
 * The wallet's own actions never notify, except the global dev-fee notices,
 * which every viewer gets. Attestations come from contract state instead
 * (see `fromAttestations`), so their logs return null.
 */
export function classify(
  log: ContractLog,
  { wallet, myTokens, attestedTokens }: WalletContext
): PendingNotification | null {
  const id = `${log.transactionHash}:${log.logIndex}`;
  const { args } = log;

  switch (log.eventName) {
    case "DevFeeSet":
      return { id, kind: "devFee", value: String(args.devFee) };
    case "DevFeeReceiverSet":
      return { id, kind: "devFeeReceiver", actor: lower(args.receiver) };
  }

  if (!wallet || args.tokenId === undefined) return null;
  const tokenId = String(args.tokenId);

  switch (log.eventName) {
    case "TokenTransferred": {
      const from = lower(args.from);
      const to = lower(args.to);
      if (from === wallet) return null;
      if (to === wallet) return { id, kind: "received", tokenId, actor: from };
      if (attestedTokens.has(tokenId)) {
        return { id, kind: "attestedMoved", tokenId, actor: to };
      }
      return null;
    }
    case "TokenFlagged": {
      const flagger = lower(args.flagger);
      if (!myTokens.has(tokenId) || flagger === wallet) return null;
      return {
        id,
        kind: "flagged",
        tokenId,
        actor: flagger,
        value: String(args.flagCount),
      };
    }
    case "TokenAutoFlagged":
      return myTokens.has(tokenId)
        ? { id, kind: "autoFlagged", tokenId }
        : null;
  }
  return null;
}

/**
 * Whether a log changes what the wallet holds, attests or has been attested
 * on, so the reads behind `WalletContext` and the attestation list are stale.
 */
export function touchesWallet(
  log: ContractLog,
  { wallet, rootId, myTokens, attestedTokens }: WalletContext
): boolean {
  if (!wallet) return false;
  const { args } = log;
  const tokenId = String(args.tokenId);
  return (
    myTokens.has(tokenId) ||
    attestedTokens.has(tokenId) ||
    lower(args.to) === wallet ||
    (rootId !== undefined && args.attesterRootId === rootId)
  );
}

/**
 * Attestations given and revoked on the wallet's tokens, from contract state.
 * A token's attestations from before a stored `received` item are left out:
 * they happened while someone else held it.
 */
export function fromAttestations(
  attesters: readonly TokenAttester[],
  logItems: readonly AppNotification[]
): AppNotification[] {
  const receivedAt = new Map<string, number>();
  for (const { kind, tokenId, at } of logItems) {
    if (kind === "received" && tokenId) {
      receivedAt.set(tokenId, Math.max(at, receivedAt.get(tokenId) ?? 0));
    }
  }

  return attesters.flatMap(
    ({ attestation, displayName, tokenId, tokenName }) => {
      const base = {
        tokenId: tokenId.toString(),
        tokenName,
        actor: attestation.attesterAddress.toLowerCase(),
        actorName: displayName,
      };
      const key = `${tokenId}:${attestation.attesterTokenId}:${attestation.timestamp}`;
      const items: AppNotification[] = [
        {
          ...base,
          id: `att:${key}`,
          kind: "attested",
          at: Number(attestation.timestamp),
        },
      ];
      if (attestation.revokedAt > 0n) {
        items.push({
          ...base,
          id: `rev:${key}`,
          kind: "revoked",
          at: Number(attestation.revokedAt),
        });
      }
      const since = receivedAt.get(base.tokenId) ?? 0;
      return items.filter((item) => item.at >= since);
    }
  );
}

interface ScanResult<T> {
  /** Oldest first */
  logs: T[];
  /** The newest block left unread when the request budget ran out, else null */
  skippedTo: bigint | null;
}

/**
 * Reads `[from, to]` newest first, so a short budget keeps the latest
 * activity. A failed request halves its range and retries: RPCs cap
 * `eth_getLogs` anywhere from 10 to 10,000+ blocks, and say so in different
 * words. A single block still failing is a real error and is thrown.
 */
export async function scanLogs<T>(
  getLogs: (from: bigint, to: bigint) => Promise<T[]>,
  from: bigint,
  to: bigint,
  { range, budget }: { range: bigint; budget: number }
): Promise<ScanResult<T>> {
  const chunks: T[][] = [];
  let size = range;
  let end = to;

  for (let requests = 0; end >= from; requests++) {
    if (requests === budget) {
      return { logs: chunks.reverse().flat(), skippedTo: end };
    }
    const start = end - size + 1n > from ? end - size + 1n : from;
    try {
      chunks.push(await getLogs(start, end));
      end = start - 1n;
    } catch (error) {
      if (start === end) throw error;
      size = (end - start + 1n) / 2n;
    }
  }
  return { logs: chunks.reverse().flat(), skippedTo: null };
}

/** Items newer than the last time the panel was closed. */
export function unreadCount(
  items: readonly AppNotification[],
  lastReadAt: number | null
): number {
  if (lastReadAt === null) return 0;
  return items.filter((item) => item.at > lastReadAt).length;
}

/** Newest first, one per id; later lists win. */
export function mergeItems(
  ...lists: (readonly AppNotification[])[]
): AppNotification[] {
  const byId = new Map<string, AppNotification>();
  for (const item of lists.flat()) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => b.at - a.at);
}

/** One row's text, without the time. */
export function describe(item: AppNotification): string {
  const id = item.tokenId ? formatTokenId(BigInt(item.tokenId)) : "";
  const token = item.tokenName ? `${item.tokenName} (${id})` : id;
  const who =
    item.actorName || (item.actor ? truncateAddress(item.actor) : "someone");

  switch (item.kind) {
    case "attested":
      return `${who} attested ${token}`;
    case "revoked":
      return `${who} revoked their attestation on ${token}`;
    case "received":
      return `You received ${token} from ${who}`;
    case "flagged":
      return `${who} flagged ${token}, ${item.value} ${item.value === "1" ? "flag" : "flags"} in total`;
    case "autoFlagged":
      return `${token} was auto-flagged: too many revoked attestations`;
    case "attestedMoved":
      return `${token}, which you attest, moved to ${who}`;
    case "devFee":
      return item.value === "0"
        ? "Donations to AOSSIE are now off"
        : `The donation to AOSSIE is now ${item.value}% of each transaction's network fee`;
    case "devFeeReceiver":
      return `Donations to AOSSIE now go to ${who}`;
    case "gap":
      return "Some activity from while you were away couldn't be loaded";
  }
}

// Stored state

/** Log-derived items kept per device; attestation items are rebuilt from state. */
export const MAX_STORED = 100;

export interface NotificationState {
  /** Last block scanned, as a decimal string */
  cursor: string | null;
  /** Unix seconds of the newest item read; null until the first load sets a baseline */
  lastReadAt: number | null;
  items: AppNotification[];
}

const EMPTY_STATE: NotificationState = {
  cursor: null,
  lastReadAt: null,
  items: [],
};

export function storageKey(
  chainId: number,
  contract: string,
  wallet: string | undefined
): string {
  return `dit:notifications:v1:${chainId}:${contract.toLowerCase()}:${wallet?.toLowerCase() ?? "none"}`;
}

export function loadState(key: string): NotificationState {
  const raw = readKey(key);
  if (!raw) return EMPTY_STATE;
  try {
    return { ...EMPTY_STATE, ...(JSON.parse(raw) as NotificationState) };
  } catch {
    return EMPTY_STATE;
  }
}

/** Merges `next` into what's stored, so two open tabs don't undo each other. */
export function saveState(
  key: string,
  next: Partial<NotificationState>
): NotificationState {
  const stored = loadState(key);
  const merged: NotificationState = {
    cursor: maxBlock(stored.cursor, next.cursor ?? null),
    lastReadAt:
      stored.lastReadAt === null || next.lastReadAt == null
        ? (next.lastReadAt ?? stored.lastReadAt)
        : Math.max(stored.lastReadAt, next.lastReadAt),
    items: mergeItems(stored.items, next.items ?? []).slice(0, MAX_STORED),
  };
  writeKey(key, JSON.stringify(merged));
  return merged;
}

function maxBlock(a: string | null, b: string | null): string | null {
  if (a === null || b === null) return a ?? b;
  return BigInt(a) > BigInt(b) ? a : b;
}
