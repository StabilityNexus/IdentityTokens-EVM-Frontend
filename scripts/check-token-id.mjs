// Self-check for lib/tokenId.ts — run with `npm run check:tokenid`.
// The ids below are pinned in contracts/test/IdentityToken.t.sol too, so a
// drift between the two formulas fails here.
import assert from "node:assert/strict";
import {
  formatTokenId,
  parseTokenId,
  tokenIdFor,
  tokenTypeOf,
} from "../lib/tokenId.ts";

// First mint of each type, and the second root.
assert.equal(tokenIdFor(0, 1n), 16180339887n);
assert.equal(tokenIdFor(0, 2n), 12360679774n);
assert.equal(tokenIdFor(1, 1n), 29321932540n);
assert.equal(tokenIdFor(2, 1n), 32463525193n);

assert.equal(formatTokenId(16180339887n), "id-6180339887");
assert.equal(formatTokenId(10901699435n), "id-0901699435");
assert.equal(formatTokenId(29321932540n), "tk-9321932540");
assert.equal(formatTokenId(32463525193n), "pf-2463525193");

for (const id of [16180339887n, 10901699435n, 29321932540n, 32463525193n]) {
  assert.equal(parseTokenId(formatTokenId(id)), id);
}
assert.equal(parseTokenId("  PF-2463525193 "), 32463525193n);

for (const bad of [
  "tk-1",
  "tk-901699435",
  "tk-09016994350",
  "xx-0901699435",
  "29321932540",
  "#2",
  "",
]) {
  assert.equal(parseTokenId(bad), undefined, bad);
}

assert.equal(tokenTypeOf(16180339887n), 0);
assert.equal(tokenTypeOf(29321932540n), 1);
assert.equal(tokenTypeOf(32463525193n), 2);
assert.equal(tokenTypeOf(5n), undefined);
assert.equal(tokenTypeOf(40000000000n), undefined);

console.log("tokenId: all checks passed");
