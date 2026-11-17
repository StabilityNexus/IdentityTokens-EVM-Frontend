// Self-check for the contract address overrides — run with `npm run check:contracts`.
import assert from "node:assert/strict";

const SEPOLIA_IDENTITY = "0x15253A56CD3EbC2893914C2139094dc92a42c016";
const SEPOLIA_PROFILE = "0x17dc6AA09432d61ca630b523DAF01fB2b98Bd58D";
const ANVIL_IDENTITY = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ANVIL_PROFILE = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// The module reads these at import time, so set them before loading it.
process.env.NEXT_PUBLIC_IDENTITY_SYSTEM_ADDRESS = ANVIL_IDENTITY;
process.env.NEXT_PUBLIC_PROFILE_SYSTEM_ADDRESS = ANVIL_PROFILE;

const { IDENTITY_SYSTEM_ADDRESS, PROFILE_SYSTEM_ADDRESS, deploymentAddress } =
  await import("../lib/contracts.ts");

// Configured deployments are used, normalised to their checksummed form.
assert.equal(IDENTITY_SYSTEM_ADDRESS, ANVIL_IDENTITY);
assert.equal(PROFILE_SYSTEM_ADDRESS, ANVIL_PROFILE);
assert.equal(
  deploymentAddress(ANVIL_IDENTITY.toLowerCase(), SEPOLIA_IDENTITY),
  ANVIL_IDENTITY
);

// Missing or invalid values keep the official Sepolia deployment.
assert.equal(deploymentAddress(undefined, SEPOLIA_IDENTITY), SEPOLIA_IDENTITY);
assert.equal(deploymentAddress("", SEPOLIA_IDENTITY), SEPOLIA_IDENTITY);
assert.equal(
  deploymentAddress("not-an-address", SEPOLIA_IDENTITY),
  SEPOLIA_IDENTITY
);
assert.equal(deploymentAddress("0x123", SEPOLIA_PROFILE), SEPOLIA_PROFILE);

console.log("Contract address overrides OK");
