import type {
  AttesterView,
  ProfileLink,
  ProfileMetadata,
} from "./types.responses";

// --- Enums & Shared Types ---
export type TokenCardVariant = "home" | "history" | "discover";
export type TokenListVariant = "tokens" | "history" | "discover";
export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

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
  owner?: string;
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
  /** When given, top right shows this attester count instead. */
  attesters?: number;
  /** No float, tilt or surface motion — a static card (the dashboard). */
  still?: boolean;
  /** Turns the card slowly, right to left, while a reservation confirms. */
  spinning?: boolean;
  /** Fired when the card has come to rest facing front after spinning. */
  onSpinSettled?: () => void;
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
  /** Open as an editor of this existing profile instead of creating one. */
  edit?: {
    tokenId: bigint;
    profile: ProfileMetadata;
    links: readonly ProfileLink[];
  };
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
  onFocus?: () => void;
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
}

export interface IDMetricsProps {
  name?: string;
  walletAddress?: string;
  /** The wallet's identity id, shown as id-…; null when it has none. */
  rootId?: bigint | null;
  /** How many people hold an active attestation on the wallet's tokens. */
  attesters?: number;
  className?: string;
  lastUpdated?: string;
  /** Whether this is the viewer's own wallet; picks the share copy. */
  isOwn?: boolean;
}

/** One attestation on one token, any status, as "Who attested" lists it. */
export interface TokenAttester extends AttesterView {
  tokenId: bigint;
  tokenName: string;
}

export interface WhoAttestedData {
  /** Newest first, revoked and expired included. */
  attesters: TokenAttester[];
  isLoading: boolean;
  isError: boolean;
}

export interface DashboardMetricsProps
  extends Omit<IDMetricsProps, "attesters">, MetricsProps {
  /** Also gives the ID card its attester count. */
  whoAttested: WhoAttestedData;
}

export interface MetricsProps {
  totalAttestations?: number;
  activeTokens?: number;
  socials?: number;
  className?: string;
}
