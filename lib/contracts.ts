/**
 * Contract addresses for the TNT (Trust Network Token) contract per chain.
 *
 * Update each address after deployment. `0x0` means not yet deployed on that network.
 * Chain IDs follow viem/wagmi conventions:
 *   mainnet  = 1
 *   sepolia  = 11155111
 *   polygon  = 137
 *   optimism = 10
 *   arbitrum = 42161
 *   base     = 8453
 */

export const TNT_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0x0000000000000000000000000000000000000000", // Ethereum mainnet — not deployed yet
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia testnet — update after deployment
  137: "0x0000000000000000000000000000000000000000", // Polygon
  10: "0x0000000000000000000000000000000000000000", // Optimism
  42161: "0x0000000000000000000000000000000000000000", // Arbitrum One
  8453: "0x0000000000000000000000000000000000000000", // Base
} as const;

/**
 * Returns the TNT contract address for a given chain ID,
 * or undefined if no address is configured for that chain.
 */
export function getTNTAddress(chainId: number): `0x${string}` | undefined {
  const addr = TNT_ADDRESSES[chainId];
  // Treat the zero address as "not deployed"
  if (!addr || addr === "0x0000000000000000000000000000000000000000") {
    return undefined;
  }
  return addr;
}
