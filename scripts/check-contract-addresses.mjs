// Self-check for the contract address overrides — run with `npm run check:contracts`.
import assert from "node:assert/strict";
import { foundry, sepolia } from "wagmi/chains";

const SEPOLIA_IDENTITY = "0x15253A56CD3EbC2893914C2139094dc92a42c016";
const SEPOLIA_PROFILE = "0x17dc6AA09432d61ca630b523DAF01fB2b98Bd58D";
const ANVIL_IDENTITY = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ANVIL_PROFILE = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// The module reads these at import time, so set them before loading it.
process.env.NEXT_PUBLIC_IDENTITY_SYSTEM_ADDRESS = ANVIL_IDENTITY;
process.env.NEXT_PUBLIC_PROFILE_SYSTEM_ADDRESS = ANVIL_PROFILE;

const { SYSTEM_ADDRESSES, deploymentAddress } =
  await import("../lib/contracts.ts");

// Configured deployments are used for the local Foundry chain.
assert.deepEqual(SYSTEM_ADDRESSES[foundry.id], {
  identity: ANVIL_IDENTITY,
  profile: ANVIL_PROFILE,
});

// Sepolia keeps the official deployment even when the env points at Anvil.
assert.deepEqual(SYSTEM_ADDRESSES[sepolia.id], {
  identity: SEPOLIA_IDENTITY,
  profile: SEPOLIA_PROFILE,
});

// Chains without a deployment have no entry.
assert.equal(SYSTEM_ADDRESSES[1], undefined);

// Missing values fall back; valid values are kept as written.
assert.equal(deploymentAddress(undefined, ANVIL_IDENTITY), ANVIL_IDENTITY);
assert.equal(deploymentAddress("", ANVIL_IDENTITY), ANVIL_IDENTITY);
assert.equal(
  deploymentAddress(ANVIL_IDENTITY.toLowerCase(), ANVIL_IDENTITY),
  ANVIL_IDENTITY.toLowerCase()
);

// Invalid values throw.
assert.throws(
  () => deploymentAddress("not-an-address", ANVIL_IDENTITY),
  /Invalid contract address in \.env/
);
assert.throws(
  () => deploymentAddress("0x123", ANVIL_PROFILE),
  /Invalid contract address in \.env/
);

console.log("Contract address overrides OK");
