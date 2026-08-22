import React from "react";

// --- Enums & Shared Types ---
export type TokenCardVariant = "home" | "history" | "discover";
export type TokenListVariant = "tokens" | "history" | "discover";
export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";
export type RankName =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "champion";

/**
 * Mirrors the on-chain `DataTypes.TokenType` enum.
 *
 * ROOT is a wallet's identity anchor and PROFILE is its public profile record.
 * Neither is a credential the user minted, so both are filtered out of the
 * lists that surface a wallet's tokens.
 */
export const TOKEN_TYPE = {
  ROOT: 0,
  SUB: 1,
  PROFILE: 2,
} as const;

// --- Component Props ---

export interface TokenCardProps {
  variant: TokenCardVariant;
  tokenId: string;
  name: string;
  type: string;
  expiresIn: string;
  endorsements?: number;
  historyAction?: "endorsed" | "revoked" | "flagged";
  actionWalletId?: string;
  onRevoke?: () => void;
  onEndorse?: () => void;
  onViewAll?: () => void;
}

export interface FeatureCardProps {
  bgImage: string;
  title: string;
  textColor?: string;
}

export interface IDCardProps {
  name?: string;
  age?: number;
  nationality?: string;
  walletAddress?: string;
  endorsers?: number;
  className?: string;
  telegramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
}

export interface TransactionStatusProps {
  status: TxStatus;
  txHash?: string;
  error?: unknown;
  successMessage?: string;
  className?: string;
}

export interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface TokenFormProps {
  isOpen: boolean;
  onClose: () => void;
  tokenName?: string;
  tokenId?: bigint;
  onSuccess?: () => void;
}

export interface EndorseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  tokenName?: string;
  onSuccess?: () => void;
}

export interface BadgeProps {
  rank: RankName;
  size?: number;
  className?: string;
}

export interface TrustScoreProps {
  score?: number;
  flags?: string;
  description?: string;
  className?: string;
}

export interface UITokenData {
  tokenId: string;
  name: string;
  type: string;
  expiresIn: string;
  endorsements?: number;
  historyAction?: "endorsed" | "revoked" | "flagged";
  actionWalletId?: string;
  owner?: string;
}

export interface UserTokenListProps {
  tokens: UITokenData[];
  className?: string;
  onRevoke?: (tokenId: string) => void;
  onEndorse?: (tokenId: string) => void;
  onViewAll?: (tokenId: string) => void;
}

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Fired on Enter — lets a host defer navigation until the query is complete. */
  onSubmit?: () => void;
  className?: string;
}

export interface TokenListProps {
  variant: TokenListVariant;
  tokens: UITokenData[];
  className?: string;
  onRevoke?: (tokenId: string) => void;
  onEndorse?: (tokenId: string) => void;
  onViewAll?: (tokenId: string) => void;
}

export interface MetricItemProps {
  label: string;
  value: string | number;
  badgeContent?: React.ReactNode;
}

export interface IDMetricsProps extends IDCardProps {
  lastUpdated?: string;
}

export interface DashboardMetricsProps extends IDMetricsProps, MetricsProps {
  trustScore?: number;
  trustFlags?: string;
  trustDescription?: string;
}

export interface MetricsProps {
  totalEndorsements?: number;
  activeTokens?: number;
  socials?: number;
  badgesEarned?: string;
  badgeRank?: RankName;
  badgeDescription?: string;
  className?: string;
}
