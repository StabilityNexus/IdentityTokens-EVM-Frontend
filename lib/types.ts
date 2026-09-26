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
  attestations?: number;
  historyAction?: "attested" | "revoked" | "flagged";
  actionWalletId?: string;
  onRevoke?: () => void;
  onAttest?: () => void;
  onViewAll?: () => void;
  /** Hide owner-only actions when showing someone else's token. */
  readOnly?: boolean;
}

export interface FeatureCardProps {
  bgImage: string;
  title: string;
  textColor?: string;
}

export interface IDCardProps {
  /** Username without the `@`; empty shows the placeholder. */
  username: string;
  walletAddress?: string;
  /** Issue date printed top right, e.g. "SEPTEMBER / 2026". */
  dateLabel?: string;
  /** When given, top right shows the rank badge and this count instead. */
  attesters?: number;
  /** No float, tilt or surface motion — a static card (the dashboard). */
  still?: boolean;
  /** Turns the card slowly, right to left, while a reservation confirms. */
  spinning?: boolean;
  /** Fired when the card has come to rest facing front after spinning. */
  onSpinSettled?: () => void;
  /** Each new non-null value shakes the card once, e.g. for a taken name. */
  shakeSignal?: string | null;
  className?: string;
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

export interface RegistrationModalProps {
  /** Fired once the root identity transaction has been signed and broadcast. */
  onSubmitted?: () => void;
}

export interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  walletAddress?: string;
  dateLabel: string;
  txHash?: string;
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

export interface AttestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  tokenName?: string;
  onSuccess?: () => void;
}

export interface BadgeProps {
  rank: RankName;
  /** Pixels, or any CSS length (e.g. "7.5cqw" to scale with a card). */
  size?: number | string;
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
  attestations?: number;
  historyAction?: "attested" | "revoked" | "flagged";
  actionWalletId?: string;
  owner?: string;
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
  title?: string;
  onRevoke?: (tokenId: string) => void;
  onAttest?: (tokenId: string) => void;
  onViewAll?: (tokenId: string) => void;
  readOnly?: boolean;
  emptyMessage?: string;
}

export interface MetricItemProps {
  label: string;
  value: string | number;
  badgeContent?: React.ReactNode;
}

export interface IDMetricsProps {
  name?: string;
  walletAddress?: string;
  /** Attestations on the wallet's tokens, its profile token excluded. */
  attesters?: number;
  className?: string;
  lastUpdated?: string;
  /** Whether this is the viewer's own wallet; picks the share copy. */
  isOwn?: boolean;
}

export interface DashboardMetricsProps extends IDMetricsProps, MetricsProps {
  trustScore?: number;
  trustFlags?: string;
  trustDescription?: string;
}

export interface MetricsProps {
  totalAttestations?: number;
  activeTokens?: number;
  socials?: number;
  badgeRank?: RankName;
  badgeDescription?: string;
  className?: string;
}
