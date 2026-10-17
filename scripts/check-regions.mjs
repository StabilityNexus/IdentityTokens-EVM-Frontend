// Self-check for the region helpers in lib/countries.ts — run with
// `npm run check:regions`. Profiles saved before regions existed must still
// read back, so the legacy cases are the ones worth guarding.
import assert from "node:assert/strict";
import {
  customRegion,
  encodeRegions,
  isSameRegion,
  parseRegions,
} from "../lib/countries.ts";

const india = { code: "IN", name: "India" };

assert.deepEqual(parseRegions(""), []);
assert.deepEqual(parseRegions("IN"), [india]);

// Built-ins by code, custom regions by name, in the order they were picked.
const stored = "IN|~Kurdistan|US";
assert.deepEqual(parseRegions(stored), [
  india,
  { name: "Kurdistan" },
  { code: "US", name: "United States" },
]);
assert.equal(encodeRegions(parseRegions(stored)), stored);

// Legacy single values: a country name (commas included) or free text.
assert.deepEqual(parseRegions("Aruba"), [{ code: "AW", name: "Aruba" }]);
assert.deepEqual(parseRegions("korea, republic of"), [
  { code: "KR", name: "Korea, Republic of" },
]);
assert.deepEqual(parseRegions("Atlantis"), [{ name: "Atlantis" }]);

// Typed text cannot break the format.
assert.deepEqual(customRegion("  West | Bank  "), { name: "West Bank" });
assert.equal(customRegion(" | "), undefined);
assert.equal(customRegion("x".repeat(60)).name.length, 40);
assert.deepEqual(parseRegions(encodeRegions([customRegion("~odd")])), [
  { name: "~odd" },
]);

assert.ok(isSameRegion({ name: "kurdistan" }, { name: "Kurdistan" }));
assert.ok(!isSameRegion(india, { name: "India" }));

console.log("region checks passed");
