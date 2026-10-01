// Self-check for lib/profileData.ts — run with `npm run check:profile`.
// The diff decides what gets written (and paid for) on-chain, so it is worth
// a guard even without a test runner in this repo.
import assert from "node:assert/strict";
import {
  PROFILE_FIELD,
  diffProfile,
  linksFromChain,
  nextFreeSlot,
  normalizeProfile,
  profileToForm,
  toLinkUpdates,
} from "../lib/profileData.ts";

const chain = {
  name: "Alice",
  username: "alice",
  nationality: "US",
  github: "alice",
  email: "",
  discord: "alice#1",
  xDotCom: "alice",
  websitePortfolioLink: "https://alice.dev",
  ens: "",
  avatarId: "a01",
};
const empty = { label: "", url: "" };
const chainLinks = [
  { label: "One", url: "https://one.dev" },
  { label: "Two", url: "https://two.dev" },
  { label: "Three", url: "https://three.dev" },
  empty,
  empty,
  empty,
];

const form = profileToForm(chain);
const rows = linksFromChain(chainLinks);
const diff = (nextForm, nextRows = rows, avatarId = chain.avatarId) =>
  diffProfile(
    chain,
    chainLinks,
    normalizeProfile(nextForm, avatarId),
    nextRows
  );
const noChange = { fields: [], links: [] };

// An untouched form has nothing to send.
assert.deepEqual(diff(form), noChange);

// "@handle" and a missing protocol are normalised away, not changes.
assert.deepEqual(
  diff({ ...form, xDotCom: " @alice ", website: "alice.dev" }),
  noChange
);

// One edited field is exactly one FieldUpdate.
assert.deepEqual(diff({ ...form, discord: "alice_new" }).fields, [
  { field: PROFILE_FIELD.DISCORD, value: "alice_new" },
]);

// The username is never sent, even if the form value changes.
assert.deepEqual(diff({ ...form, username: "mallory" }), noChange);

// Avatar changes travel as their own field.
assert.deepEqual(diff(form, rows, "a05").fields, [
  { field: PROFILE_FIELD.AVATAR, value: "a05" },
]);

// Removing the middle link clears only its slot.
const withoutTwo = rows.filter((row) => row.slot !== 1);
assert.deepEqual(diff(form, withoutTwo).links, [
  { slot: 1, label: "", url: "" },
]);

// Editing a link rewrites only that slot.
const editedThree = rows.map((row) =>
  row.slot === 2 ? { ...row, url: "https://3.dev" } : row
);
assert.deepEqual(diff(form, editedThree).links, [
  { slot: 2, label: "Three", url: "https://3.dev" },
]);

// A new link takes the lowest free slot.
assert.equal(nextFreeSlot(withoutTwo), 1);
assert.equal(nextFreeSlot(rows), 3);
assert.equal(
  nextFreeSlot(
    [0, 1, 2, 3, 4, 5].map((slot) => ({ label: "", url: "", slot }))
  ),
  undefined
);

// Creating a profile writes only the filled rows, at their slots.
assert.deepEqual(
  toLinkUpdates([
    { label: " Blog ", url: " https://blog.dev ", slot: 0 },
    { label: "Draft", url: "  ", slot: 1 },
  ]),
  [{ slot: 0, label: "Blog", url: "https://blog.dev" }]
);

console.log("profileData checks passed");
