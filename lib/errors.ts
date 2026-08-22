const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  // Transfer
  RootNonTransferable: "Root identity tokens cannot be transferred.",
  UseTransferToken:
    "Please use the Transfer function instead of direct transfer.",
  CannotTransferRoot: "Root identity tokens cannot be transferred.",
  SelfTransfer: "You cannot transfer a token to yourself.",
  ZeroAddress: "Invalid address: cannot send to zero address.",
  NotHolder: "You do not own this token.",

  // Identity
  NoRootIdentity:
    "You need a root identity first. One will be created automatically.",
  AlreadyHasRoot: "You already have a root identity.",
  RootDeactivated: "Your root identity has been deactivated.",
  InvalidExpiry: "The expiry date must be in the future.",

  // Profile
  AlreadyMintedProfile: "You already have a profile.",
  RecipientAlreadyHasProfile: "The recipient already has a profile.",
  ProfileNameRequired: "Profile name is required.",
  ProfileUsernameRequired: "Username is required.",
  ProfileUsernameTaken: "This username is already taken.",
  ProfileUsernameTooShort: "Username must be at least 3 characters.",
  ProfileUsernameTooLong: "Username must be 32 characters or fewer.",
  InvalidProfileUsernameChar:
    "Username can only contain lowercase letters, numbers, dots (.) and underscores (_).",

  // Token
  NotToken: "This is not a valid token for this operation.",
  TokenExpired: "This token has expired.",

  // Endorsement
  CannotEndorseOwnToken: "You cannot endorse your own token.",
  AlreadyEndorsed: "You have already endorsed this token.",
  NotYourEndorsement: "This is not your endorsement.",
  AlreadyRevoked: "This endorsement has already been revoked.",
  EndorsementExpired: "This endorsement has expired.",
  TokenExpiresTooSoon:
    "The token expires too soon for this endorsement duration.",
  NoActiveEndorsement: "No active endorsement found.",

  // Flag
  AlreadyFlaggedByRoot: "You have already flagged this token.",
  CannotFlagOwnToken: "You cannot flag your own token.",

  // Admin
  NotAdmin: "Only the admin can perform this action.",
  OnlyProfileSystem: "This function can only be called by the Profile System.",
  ProfileSystemAlreadySet: "The Profile System has already been configured.",
};

/**
 * The human-readable text of an error and its `cause` chain.
 *
 * Deliberately narrow. Serialising the whole error pulls in viem's `abi`, which
 * declares every error name the contract has, so matching against it selects a
 * message unrelated to what actually reverted.
 */
function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  let node: unknown = error;

  // Bounded, so a self-referencing cause chain cannot loop forever.
  for (let depth = 0; node && depth < 10; depth += 1) {
    const current = node as Record<string, unknown>;

    for (const key of [
      "shortMessage",
      "details",
      "message",
      "errorName",
      "name",
    ]) {
      const value = current[key];
      if (typeof value === "string") parts.push(value);
    }

    if (Array.isArray(current.metaMessages)) {
      for (const line of current.metaMessages) {
        if (typeof line === "string") parts.push(line);
      }
    }

    const data = current.data as Record<string, unknown> | undefined;
    if (typeof data?.errorName === "string") parts.push(data.errorName);

    node = current.cause;
  }

  return parts.join("\n");
}

export function getContractErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  const errObj = error as Record<string, unknown>;

  // Walk viem's error tree for a ContractFunctionRevertedError or custom errorName
  if (typeof errObj?.walk === "function") {
    let customMsg: string | undefined;
    (errObj.walk as (cb: (node: Record<string, unknown>) => boolean) => void)(
      (node: Record<string, unknown>) => {
        const data = node?.data as Record<string, unknown> | undefined;
        const errorName = data?.errorName || node?.errorName || node?.name;
        if (
          typeof errorName === "string" &&
          CONTRACT_ERROR_MESSAGES[errorName]
        ) {
          customMsg = CONTRACT_ERROR_MESSAGES[errorName];
          return true;
        }
        return false;
      }
    );
    if (customMsg) return customMsg;
  }

  // Fall back to the error's own text. Every key here is a plain identifier, so
  // the word boundaries keep one error name from matching inside a longer one.
  const errorText =
    typeof error === "string" ? error : collectErrorText(errObj);

  for (const [errorName, message] of Object.entries(CONTRACT_ERROR_MESSAGES)) {
    if (new RegExp(`\\b${errorName}\\b`).test(errorText)) {
      return message;
    }
  }

  // Fallback to shortMessage if useful
  if (typeof errObj?.shortMessage === "string") {
    return errObj.shortMessage;
  }

  if (typeof errObj?.message === "string") {
    return errObj.message.length > 200
      ? errObj.message.slice(0, 200) + "…"
      : errObj.message;
  }

  return "An unexpected error occurred. Please try again.";
}

// Sepolia Etherscan base URL
export const ETHERSCAN_BASE_URL = "https://sepolia.etherscan.io";

// Returns an Etherscan link for a transaction hash
export function getEtherscanTxUrl(txHash: string): string {
  return `${ETHERSCAN_BASE_URL}/tx/${txHash}`;
}

// Returns an Etherscan link for an address
export function getEtherscanAddressUrl(address: string): string {
  return `${ETHERSCAN_BASE_URL}/address/${address}`;
}
