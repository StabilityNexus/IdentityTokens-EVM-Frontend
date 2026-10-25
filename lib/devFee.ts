/**
 * The optional donation to AOSSIE. `devFee` is set on-chain as a percentage of
 * each transaction's gas fee (100 = equal to it), so the amount follows gas
 * prices on any chain without anyone updating it.
 */

/** Wei to donate for a call that uses `gas` at `gasPrice`. */
export function donationAmount(
  gas: bigint,
  gasPrice: bigint,
  devFee: bigint
): bigint {
  return (gas * gasPrice * devFee) / 100n;
}

/** How the donation compares to the network fee, for the checkbox label. */
export function describeDevFee(devFee: bigint): string {
  return devFee === 100n
    ? "Equal to this transaction's network fee"
    : `${devFee}% of this transaction's network fee`;
}

/** Reads the dev page's percentage field: a whole number from 0 to `max`. */
export function parseDevFeeInput(
  text: string,
  max: bigint
): { value: bigint } | { error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { error: "Enter a percentage." };
  if (!/^\d+$/.test(trimmed)) return { error: "Use a whole number, like 100." };

  const value = BigInt(trimmed);
  if (value > max) return { error: `The most it can be is ${max}%.` };
  return { value };
}
