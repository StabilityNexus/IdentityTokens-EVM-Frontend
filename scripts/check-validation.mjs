// Self-check for lib/validation.ts — run with `npm run check:validation`.
import assert from "node:assert/strict";
import { validateEns } from "../lib/validation.ts";

// Subnames, emoji and DNS names are all valid ENS names.
for (const name of [
  "vitalik.eth",
  "alice.base.eth",
  "pay.vitalik.eth",
  "🦊.eth",
  "nick.xyz",
]) {
  assert.equal(validateEns(name).status, "valid", name);
}

for (const bad of [".eth", "a..eth", "alice base.eth", "vitalik"]) {
  assert.equal(validateEns(bad).status, "invalid", bad);
}

assert.equal(validateEns("").status, "idle");
assert.deepEqual(validateEns("Vitalik.eth"), {
  status: "warning",
  message: "ENS uses this form.",
  suggestion: "vitalik.eth",
});

console.log("validation: all checks passed");
