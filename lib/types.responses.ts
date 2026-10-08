export interface ProfileMetadata {
  name: string;
  username: string;
  nationality: string;
  github: string;
  email: string;
  discord: string;
  xDotCom: string;
  websitePortfolioLink: string;
  ens: string;
  avatarId: string;
}

/** One on-chain custom-link slot; an empty url means the slot is free. */
export interface ProfileLink {
  label: string;
  url: string;
}

export interface TokenData {
  tokenId: bigint;
  parentRootId: bigint;
  tokenName: string;
  tokenType: string;
  tokenValue: `0x${string}`;
  about: string;
  validUntil: bigint;
  createdAt: bigint;
  totalAttestationCount: bigint;
  revokedCount: bigint;
  isFlagged: boolean;
  flagCount: bigint;
  transferCount: bigint;
}

export interface Attestation {
  attesterTokenId: bigint;
  attesterAddress: `0x${string}`;
  timestamp: bigint;
  revokedAt: bigint;
  expiresAt: bigint;
}

export interface RootIdentityView {
  tokenId: bigint;
  walletAddress: `0x${string}`;
  displayName: string;
  createdAt: bigint;
  isActive: boolean;
  tokenCount: bigint;
}

export interface AttesterView {
  attestation: Attestation;
  displayName: string;
}
