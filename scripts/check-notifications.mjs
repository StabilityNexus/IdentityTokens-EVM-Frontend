// Self-check for lib/notifications.ts — run with `npm run check:notifications`.
import assert from "node:assert/strict";
import {
  classify,
  fromAttestations,
  mergeItems,
  saveState,
  scanLogs,
  touchesWallet,
  unreadCount,
} from "../lib/notifications.ts";

const ME = "0x00000000000000000000000000000000000000aa";
const ALICE = "0x00000000000000000000000000000000000000bb";
const BOB = "0x00000000000000000000000000000000000000cc";
const MINE = 20000000001n;
const ATTESTED = 20000000002n;
const OTHER = 20000000009n;

const ctx = {
  wallet: ME,
  rootId: 10000000001n,
  myTokens: new Set([String(MINE)]),
  attestedTokens: new Set([String(ATTESTED)]),
};
const disconnected = { myTokens: new Set(), attestedTokens: new Set() };

let logIndex = 0;
const log = (eventName, args) => ({
  eventName,
  args,
  blockNumber: 1n,
  transactionHash: "0x01",
  logIndex: logIndex++,
});
const kind = (l, c = ctx) => classify(l, c)?.kind ?? null;
const transfer = (tokenId, from, to) =>
  log("TokenTransferred", { tokenId, from, to });

// Each kind; the wallet's own actions never notify.
assert.equal(kind(transfer(OTHER, ALICE, ME)), "received");
assert.equal(kind(transfer(MINE, ME, ALICE)), null);
assert.equal(kind(transfer(ATTESTED, ALICE, BOB)), "attestedMoved");
assert.equal(kind(transfer(OTHER, ALICE, BOB)), null);
assert.equal(
  kind(log("TokenFlagged", { tokenId: MINE, flagger: ALICE, flagCount: 2n })),
  "flagged"
);
assert.equal(
  kind(log("TokenFlagged", { tokenId: OTHER, flagger: ALICE, flagCount: 2n })),
  null
);
assert.equal(
  kind(log("TokenAutoFlagged", { tokenId: MINE, reason: "x" })),
  "autoFlagged"
);
// Attestations come from contract state, not logs.
assert.equal(
  kind(
    log("AttestationGiven", {
      attesterRootId: 1n,
      tokenId: MINE,
      expiresAt: 9n,
    })
  ),
  null
);
assert.equal(kind(log("DevFeeSet", { devFee: 50n })), "devFee");

// Disconnected: only the global notices.
assert.equal(
  kind(log("DevFeeReceiverSet", { receiver: BOB }), disconnected),
  "devFeeReceiver"
);
assert.equal(kind(transfer(OTHER, ALICE, ME), disconnected), null);

// Checksummed addresses from the RPC still match the lowercased wallet.
const checksummed = "0x00000000000000000000000000000000000000AA";
assert.equal(kind(transfer(MINE, checksummed, ALICE)), null);

// Which logs make the wallet's reads stale.
assert.equal(touchesWallet(transfer(OTHER, ALICE, ME), ctx), true);
assert.equal(touchesWallet(transfer(ATTESTED, ALICE, BOB), ctx), true);
assert.equal(
  touchesWallet(
    log("AttestationGiven", { attesterRootId: ctx.rootId, tokenId: OTHER }),
    ctx
  ),
  true
);
assert.equal(touchesWallet(transfer(OTHER, ALICE, BOB), ctx), false);
assert.equal(touchesWallet(log("DevFeeSet", { devFee: 1n }), ctx), false);
assert.equal(touchesWallet(transfer(OTHER, ALICE, ME), disconnected), false);

// Attestations: one item each, plus one per revocation.
const attestation = (timestamp, revokedAt) => ({
  attestation: {
    attesterTokenId: 1n,
    attesterAddress: ALICE,
    timestamp,
    revokedAt,
    expiresAt: 0n,
  },
  displayName: "Alice",
  tokenId: MINE,
  tokenName: "GitHub",
});
const kindsAt = (items) => items.map((i) => [i.kind, i.at]);
assert.deepEqual(
  kindsAt(fromAttestations([attestation(10n, 0n), attestation(20n, 30n)], [])),
  [
    ["attested", 10],
    ["attested", 20],
    ["revoked", 30],
  ]
);
// A received token's attestations from before the wallet held it are dropped.
const received = {
  id: "r",
  kind: "received",
  at: 25,
  tokenId: String(MINE),
};
assert.deepEqual(
  kindsAt(
    fromAttestations([attestation(10n, 0n), attestation(20n, 30n)], [received])
  ),
  [["revoked", 30]]
);

// Newest first, one per id; unread counts items after lastReadAt.
const items = mergeItems(
  [
    { id: "a", kind: "devFee", at: 5 },
    { id: "b", kind: "devFee", at: 9 },
  ],
  [
    { id: "a", kind: "devFee", at: 5 },
    { id: "c", kind: "devFee", at: 7 },
  ]
);
assert.deepEqual(
  items.map((i) => i.id),
  ["b", "c", "a"]
);
assert.equal(unreadCount(items, 6), 2);
assert.equal(unreadCount(items, null), 0, "no baseline yet");

// scanLogs against an RPC that rejects ranges over 10 blocks.
const calls = [];
const rpc = async (from, to) => {
  calls.push([from, to]);
  if (to - from + 1n > 10n) throw new Error("block range too large");
  return [Number(from)];
};
// Halving starts from the range actually sent, so no request repeats; logs
// come back oldest first.
let result = await scanLogs(rpc, 0n, 39n, { range: 10_000n, budget: 50 });
assert.equal(result.skippedTo, null);
assert.deepEqual(calls, [
  [0n, 39n],
  [20n, 39n],
  [30n, 39n],
  [20n, 29n],
  [10n, 19n],
  [0n, 9n],
]);
assert.deepEqual(result.logs, [0, 10, 20, 30]);
// A short budget keeps the newest blocks.
calls.length = 0;
result = await scanLogs(rpc, 0n, 99n, { range: 10n, budget: 3 });
assert.equal(result.skippedTo, 69n);
assert.deepEqual(calls, [
  [90n, 99n],
  [80n, 89n],
  [70n, 79n],
]);
assert.deepEqual(result.logs, [70, 80, 90]);
// An error that isn't about the range fails a 2-block poll in 2 requests.
calls.length = 0;
const down = async (from, to) => {
  calls.push([from, to]);
  throw new Error("down");
};
await assert.rejects(scanLogs(down, 10n, 11n, { range: 10_000n, budget: 50 }));
assert.deepEqual(calls, [
  [10n, 11n],
  [11n, 11n],
]);

// saveState merges with what another tab stored.
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
  },
};
saveState("k", {
  cursor: "100",
  lastReadAt: 50,
  items: [{ id: "x", kind: "devFee", at: 40 }],
});
const merged = saveState("k", {
  cursor: "90",
  lastReadAt: 30,
  items: [{ id: "y", kind: "devFee", at: 60 }],
});
assert.equal(merged.cursor, "100", "cursor never moves back");
assert.equal(merged.lastReadAt, 50, "read state never moves back");
assert.deepEqual(
  merged.items.map((i) => i.id),
  ["y", "x"]
);

console.log("notifications: all checks passed");
