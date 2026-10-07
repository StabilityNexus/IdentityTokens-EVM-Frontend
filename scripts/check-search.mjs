// Self-check for lib/search.ts — run with `npm run check:search`.
import assert from "node:assert/strict";
import { searchEntries } from "../lib/search.ts";

const e = (kind, digits, title, extra = {}) => ({
  kind,
  id: BigInt(digits),
  digits,
  title,
  ...extra,
});
const entries = [
  e("root", "6180339887", "Alice Nakamoto", { owner: "0x7099aaaa" }),
  e("root", "2360679774", "Bob Martin", { owner: "0x3c44bbbb" }),
  e("profile", "2463525193", "Alice Nakamoto", {
    username: "alice",
    owner: "0x7099aaaa",
  }),
  e("profile", "8643865080", "Bob Martin", {
    username: "bob",
    owner: "0x3c44bbbb",
  }),
  e("profile", "4824204967", "Carol Singh", {
    username: "carol",
    owner: "0x90f7cccc",
  }),
  e("token", "9321932540", "GitHub", { owner: "0x7099aaaa" }),
  e("token", "5502272427", "Smart Contract Auditor", { owner: "0x3c44bbbb" }),
];
const ids = (type, q) =>
  searchEntries(entries, type, q).map((x) => `${x.kind}:${x.digits}`);

// Partial digits: prefix hits first, then the rest, each in id order
assert.deepEqual(ids("profile", "48"), ["profile:4824204967"]);
assert.deepEqual(ids("all", "24"), [
  "profile:2463525193",
  "profile:4824204967",
  "token:5502272427",
]);
// A typed prefix narrows to that kind, whatever chip is selected
assert.deepEqual(ids("all", "pf-48"), ["profile:4824204967"]);
assert.deepEqual(ids("token", "pf-"), [
  "profile:2463525193",
  "profile:4824204967",
  "profile:8643865080",
]);
// Names and usernames, with "@" ignored and exact usernames first
assert.deepEqual(ids("username", "@car"), ["profile:4824204967"]);
assert.deepEqual(ids("all", "alice"), [
  "profile:2463525193",
  "root:6180339887",
]);
assert.deepEqual(ids("token", "git"), ["token:9321932540"]);
// Wallet prefixes match every kind that wallet holds
assert.deepEqual(ids("all", "0x7099"), [
  "profile:2463525193",
  "root:6180339887",
  "token:9321932540",
]);
assert.deepEqual(ids("id", "0x7099"), ["root:6180339887"]);
// Nothing typed, nothing found, and the limit
assert.deepEqual(ids("all", "  "), []);
assert.deepEqual(ids("all", "zzz"), []);
assert.equal(searchEntries(entries, "all", "2", 2).length, 2);

console.log("search: all checks passed");
