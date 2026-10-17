// Self-check for lib/profileData.ts — run with `npm run check:profile`.
// The diff decides what gets written (and paid for) on-chain, so it is worth
// a guard even without a test runner in this repo.
import assert from "node:assert/strict";
import {
  EDITABLE_FIELDS,
  diffLinks,
  diffProfile,
  linksFromChain,
  nextLinkKey,
  normalizeProfile,
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
];

const form = chain; // the form edits the profile as-is
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
  diff({ ...form, xDotCom: " @alice ", websitePortfolioLink: "alice.dev" }),
  noChange
);

// One edited field is exactly one FieldUpdate.
assert.deepEqual(diff({ ...form, discord: "alice_new" }).fields, [
  { field: EDITABLE_FIELDS.indexOf("discord"), value: "alice_new" },
]);

// The username is never sent, even if the form value changes.
assert.deepEqual(diff({ ...form, username: "mallory" }), noChange);

// Avatar changes travel as their own field.
assert.deepEqual(diff(form, rows, "a05").fields, [
  { field: EDITABLE_FIELDS.indexOf("avatarId"), value: "a05" },
]);

// Removing the middle link clears only its index.
const withoutTwo = rows.filter((row) => row.index !== 1);
assert.deepEqual(diff(form, withoutTwo).links, [
  { index: 1, label: "", url: "" },
]);

// Editing a link rewrites only that index.
const editedThree = rows.map((row) =>
  row.index === 2 ? { ...row, url: "https://3.dev" } : row
);
assert.deepEqual(diff(form, editedThree).links, [
  { index: 2, label: "Three", url: "https://3.dev" },
]);

// Erasing a saved link's URL clears it.
const erasedThree = rows.map((row) =>
  row.index === 2 ? { ...row, url: " " } : row
);
assert.deepEqual(diff(form, erasedThree).links, [
  { index: 2, label: "", url: "" },
]);

// A new row gets a negative key, so it can't be mistaken for a saved index.
assert.equal(nextLinkKey([]), -1);
assert.equal(nextLinkKey(rows), -1);
assert.equal(nextLinkKey([...rows, { label: "", url: "", index: -1 }]), -2);

// Adds rows the way the form does, each with the next key.
const withNew = (base, ...labels) =>
  labels.reduce(
    (list, label) => [
      ...list,
      { label, url: `https://${label}.dev`, index: nextLinkKey(list) },
    ],
    base
  );

// New links append after the saved ones, without holes.
assert.deepEqual(diff(form, withNew(rows, "four", "five")).links, [
  { index: 3, label: "four", url: "https://four.dev" },
  { index: 4, label: "five", url: "https://five.dev" },
]);

// A new link fills the index of a removed one instead of growing the list.
assert.deepEqual(diff(form, withNew(withoutTwo, "four")).links, [
  { index: 1, label: "four", url: "https://four.dev" },
]);

// Gaps already on-chain are filled first, then the list grows.
const gappy = [chainLinks[0], empty, chainLinks[2]];
assert.deepEqual(
  diffLinks(gappy, withNew(linksFromChain(gappy), "four", "five")),
  [
    { index: 1, label: "four", url: "https://four.dev" },
    { index: 3, label: "five", url: "https://five.dev" },
  ]
);

// New links keep the order they were added in, even after removing the last
// saved link: [A, B, C, D] minus B and D, plus E then F, saves as A, E, C, F.
const abcd = ["A", "B", "C", "D"].map((label) => ({
  label,
  url: `https://${label}.dev`,
}));
const keptAC = linksFromChain(abcd).filter(
  (row) => row.label === "A" || row.label === "C"
);
assert.deepEqual(diffLinks(abcd, withNew(keptAC, "E", "F")), [
  { index: 1, label: "E", url: "https://E.dev" },
  { index: 3, label: "F", url: "https://F.dev" },
]);

// Removing an unsaved row leaves no hole: the next one still appends at 3.
const [, ...withoutFirstNew] = withNew([], "four", "five");
assert.deepEqual(diff(form, [...rows, ...withoutFirstNew]).links, [
  { index: 3, label: "five", url: "https://five.dev" },
]);

// No cap: ten links on a new profile land at 0..9.
const ten = withNew([], ...Array.from({ length: 10 }, (_, i) => `l${i}`));
assert.deepEqual(
  diffLinks([], ten).map((link) => link.index),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
);

// Creating a profile (no links on-chain yet) writes only the filled rows.
assert.deepEqual(
  diffLinks(
    [],
    [
      { label: " Blog ", url: " https://blog.dev ", index: 0 },
      { label: "Draft", url: "  ", index: 1 },
    ]
  ),
  [{ index: 0, label: "Blog", url: "https://blog.dev" }]
);

console.log("profileData checks passed");
