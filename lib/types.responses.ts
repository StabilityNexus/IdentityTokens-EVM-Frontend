export interface ProfileMetadata {
  name: string;
  username: string;
  age: bigint;
  nationality: string;
  github: string;
  email: string;
  discord: string;
  xDotCom: string;
  websitePortfolioLink: string;
  ens: string;
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
  totalEndorsementCount: bigint;
  revokedCount: bigint;
  isFlagged: boolean;
  flagCount: bigint;
  transferCount: bigint;
}

export interface Endorsement {
  endorserTokenId: bigint;
  endorserAddress: `0x${string}`;
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
