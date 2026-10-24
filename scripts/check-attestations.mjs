// Self-check for the attestation helpers in lib/helpers.ts — run with
// `npm run check:attestations`.
import assert from "node:assert/strict";
import {
  NO_EXPIRY_DURATION,
  attestationStatus,
  countActiveAttesters,
  formatAttestationLength,
} from "../lib/helpers.ts";

const DAY = 86400n;
const now = BigInt(Math.floor(Date.now() / 1000));
const lasting = (seconds) =>
  formatAttestationLength({ timestamp: now, expiresAt: now + seconds });

// Units match the attest presets: days under a year, then whole years.
assert.equal(lasting(DAY - 1n), "< 1 day");
assert.equal(lasting(DAY), "1 day");
assert.equal(lasting(90n * DAY), "90 days");
assert.equal(lasting(364n * DAY), "364 days");
assert.equal(lasting(365n * DAY), "1 year");
assert.equal(lasting(800n * DAY), "2 years");
assert.equal(lasting(NO_EXPIRY_DURATION), "No expiration");

const attestation = (
  attesterTokenId,
  { revokedAt = 0n, expiresAt = now + DAY } = {}
) => ({
  attestation: { attesterTokenId, timestamp: now - DAY, revokedAt, expiresAt },
});
assert.equal(attestationStatus(attestation(1n).attestation), "active");
assert.equal(
  attestationStatus(attestation(1n, { revokedAt: now }).attestation),
  "revoked"
);
assert.equal(
  attestationStatus(attestation(1n, { expiresAt: now - 1n }).attestation),
  "expired"
);

// One person on two tokens counts once; revoked and expired don't count.
assert.equal(
  countActiveAttesters([
    attestation(1n),
    attestation(1n),
    attestation(2n),
    attestation(3n, { revokedAt: now }),
    attestation(4n, { expiresAt: now - 1n }),
  ]),
  2
);
assert.equal(countActiveAttesters([]), 0);

console.log("attestations: all checks passed");
