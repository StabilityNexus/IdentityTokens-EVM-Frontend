import { SITE_URL } from "@/lib/seo";

/** Always the production host, even when shared from a preview build. */
export const CLAIM_URL = `${SITE_URL}/claim`;

/** The public page for a wallet's identity. */
export function getWalletUrl(address: string): string {
  return `${SITE_URL}/wallet?u=${address}`;
}

/** Discover opens a searched token id straight on that token. */
export function getTokenUrl(tokenId: string): string {
  return `${SITE_URL}/discover?q=${tokenId}`;
}

/** Everything a share target needs to prefill its composer. */
export interface ShareContent {
  /** For X, Threads, Bluesky, Farcaster and messengers. */
  short: string;
  /** For LinkedIn, where the links sit inside the text. */
  long: string;
  /** For link aggregators such as Reddit. */
  title: string;
  url: string;
}

// Usernames are quoted, not `@name`, so X, Threads and Bluesky don't tag anyone.

/** A freshly reserved username, shared from /claim. */
export function buildClaimShare(username: string, url: string): ShareContent {
  return {
    short: [
      `Just reserved “${username}” on DIT`,
      "",
      "An identity that lives on-chain and is actually mine: portable and self-sovereign.",
      "",
      "Here’s mine",
    ].join("\n"),
    long: [
      "I just claimed my Decentralized Identity Token on DIT, built by Stability Nexus.",
      "",
      `It's an identity that lives on-chain instead of on a platform: portable across wallets and owned by me. My username is “${username}”.`,
      "",
      `See my identity: ${url}`,
      `Reserve yours: ${CLAIM_URL}`,
    ].join("\n"),
    title: `I just reserved “${username}” on DIT, a self-sovereign identity by Stability Nexus`,
    url,
  };
}

/** A token, asking whoever opens the link to attest it and join DIT. */
export function buildTokenShare(token: {
  id: string;
  name: string;
  type?: string;
  attestations?: number;
}): ShareContent {
  const url = getTokenUrl(token.id);
  const count = token.attestations;
  const facts = [
    token.id,
    token.type,
    !!count && `${count} attestation${count === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    short: [
      `Attest “${token.name}” on DIT`,
      "",
      facts,
      "",
      "Vouch for it on-chain, or join DIT and claim your own identity.",
    ].join("\n"),
    long: [
      `Attest “${token.name}” on DIT, the on-chain identity app by Stability Nexus.`,
      "",
      facts,
      "",
      `Open the token and attest it: ${url}`,
      `New to DIT? Claim your identity: ${CLAIM_URL}`,
    ].join("\n"),
    title: `Attest “${token.name}” (${token.id}) on DIT`,
    url,
  };
}

/** A wallet's identity page, in the first person when it's the viewer's own. */
export function buildIdentityShare(url: string, isOwn: boolean): ShareContent {
  return {
    short: isOwn
      ? "Here’s my on-chain identity on DIT\n\nPortable, self-sovereign, and owned by me."
      : "Check out this on-chain identity on DIT\n\nPortable and self-sovereign.",
    long: [
      isOwn
        ? "This is my Decentralized Identity Token on DIT, built by Stability Nexus: an identity that lives on-chain instead of on a platform, portable across wallets and owned by me."
        : "Check out this Decentralized Identity Token on DIT, built by Stability Nexus: an identity that lives on-chain instead of on a platform.",
      "",
      `See it here: ${url}`,
      `Claim yours: ${CLAIM_URL}`,
    ].join("\n"),
    title: isOwn
      ? "My self-sovereign identity on DIT by Stability Nexus"
      : "A self-sovereign identity on DIT by Stability Nexus",
    url,
  };
}
