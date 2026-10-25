// Self-check for lib/devFee.ts — run with `npm run check:devfee`.
import assert from "node:assert/strict";
import {
  describeDevFee,
  donationAmount,
  parseDevFeeInput,
} from "../lib/devFee.ts";

// 528k gas at 0.2 gwei is 0.0001056 ETH; 100% donates the same again.
assert.equal(
  donationAmount(528_000n, 200_000_000n, 100n),
  105_600_000_000_000n
);
assert.equal(donationAmount(528_000n, 200_000_000n, 50n), 52_800_000_000_000n);
assert.equal(donationAmount(528_000n, 200_000_000n, 0n), 0n);
// Ethereum Classic and testnets: the same formula on their own gas price.
assert.equal(donationAmount(211_000n, 19n, 100n), 4_009_000n);

assert.equal(describeDevFee(100n), "Equal to this transaction's network fee");
assert.equal(describeDevFee(250n), "250% of this transaction's network fee");

assert.deepEqual(parseDevFeeInput(" 100 ", 5000n), { value: 100n });
assert.deepEqual(parseDevFeeInput("0", 5000n), { value: 0n });
assert.deepEqual(parseDevFeeInput("5000", 5000n), { value: 5000n });
for (const bad of ["", "  ", "1.5", "-1", "1e3", "abc", "5001"]) {
  assert.ok("error" in parseDevFeeInput(bad, 5000n), bad);
}

console.log("devFee: all checks passed");
