export const IDENTITY_SYSTEM_ADDRESS =
  "0xe886929760A5B8E47Cb42679512C920Fd1b14431" as const;

export const PROFILE_SYSTEM_ADDRESS =
  "0xDf36b4Cc1fB9d65CB371e0ee88EB9e4b4A30E423" as const;

export * from "./types.responses";

// IdentitySystem ABI

export const IDENTITY_SYSTEM_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "burnToken",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createRootIdentity",
    inputs: [
      { name: "displayName", type: "string", internalType: "string" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createToken",
    inputs: [
      { name: "tokenName", type: "string", internalType: "string" },
      { name: "tokenType", type: "string", internalType: "string" },
      { name: "tokenValue", type: "bytes", internalType: "bytes" },
      { name: "about", type: "string", internalType: "string" },
      { name: "validUntil", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "endorseToken",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "duration", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "flagToken",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getActiveEndorsementCount",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getActiveEndorsements",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct DataTypes.Endorsement[]",
        components: [
          {
            name: "endorserTokenId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "endorserAddress",
            type: "address",
            internalType: "address",
          },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
          { name: "revokedAt", type: "uint256", internalType: "uint256" },
          { name: "expiresAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApproved",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEndorsements",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct DataTypes.Endorsement[]",
        components: [
          {
            name: "endorserTokenId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "endorserAddress",
            type: "address",
            internalType: "address",
          },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
          { name: "revokedAt", type: "uint256", internalType: "uint256" },
          { name: "expiresAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEndorsementsByEndorser",
    inputs: [
      {
        name: "endorserRootId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokenIds",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRootIdentityView",
    inputs: [{ name: "rootId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct DataTypes.RootIdentityView",
        components: [
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          {
            name: "walletAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "displayName",
            type: "string",
            internalType: "string",
          },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "isActive", type: "bool", internalType: "bool" },
          {
            name: "tokenCount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokensForRoot",
    inputs: [{ name: "rootId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTransferHistory",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWalletTokens",
    inputs: [{ name: "wallet", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasEndorsed",
    inputs: [
      {
        name: "endorserRootId",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasProfile",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintProfileToken",
    inputs: [{ name: "to", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerToRootId",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "profileSystem",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "revokeEndorsement",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rootIdentities",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "walletAddress",
        type: "address",
        internalType: "address",
      },
      { name: "displayName", type: "string", internalType: "string" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "createdAt", type: "uint256", internalType: "uint256" },
      { name: "isActive", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rootToTokenIds",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setProfileSystem",
    inputs: [
      {
        name: "_profileSystem",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      { name: "interfaceId", type: "bytes4", internalType: "bytes4" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenTypes",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum DataTypes.TokenType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokens",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "parentRootId", type: "uint256", internalType: "uint256" },
      { name: "tokenName", type: "string", internalType: "string" },
      { name: "tokenType", type: "string", internalType: "string" },
      { name: "tokenValue", type: "bytes", internalType: "bytes" },
      { name: "about", type: "string", internalType: "string" },
      { name: "validUntil", type: "uint256", internalType: "uint256" },
      { name: "createdAt", type: "uint256", internalType: "uint256" },
      {
        name: "totalEndorsementCount",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "revokedCount", type: "uint256", internalType: "uint256" },
      { name: "isFlagged", type: "bool", internalType: "bool" },
      { name: "flagCount", type: "uint256", internalType: "uint256" },
      { name: "transferCount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferHistory",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferToken",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "sendingTo", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "walletTokens",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EndorsementGiven",
    inputs: [
      {
        name: "endorserRootId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "expiresAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EndorsementRevoked",
    inputs: [
      {
        name: "endorserRootId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "endorsementIndex",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProfileSystemSet",
    inputs: [
      {
        name: "profileSystem",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RootIdentityCreated",
    inputs: [
      {
        name: "rootId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "username",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenAutoFlagged",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenBurned",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "rootId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenCreated",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "rootId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tokenName",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "tokenType",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenFlagged",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "flagger",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "flagCount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenTransferred",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  // Errors
  { type: "error", name: "AlreadyEndorsed", inputs: [] },
  { type: "error", name: "AlreadyFlaggedByRoot", inputs: [] },
  { type: "error", name: "AlreadyHasRoot", inputs: [] },
  { type: "error", name: "AlreadyRevoked", inputs: [] },
  { type: "error", name: "CannotEndorseOwnToken", inputs: [] },
  { type: "error", name: "CannotFlagOwnToken", inputs: [] },
  { type: "error", name: "CannotTransferRoot", inputs: [] },
  {
    type: "error",
    name: "ERC721IncorrectOwner",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "owner", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC721InsufficientApproval",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidApprover",
    inputs: [
      { name: "approver", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidOperator",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC721InvalidReceiver",
    inputs: [
      { name: "receiver", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidSender",
    inputs: [{ name: "sender", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC721NonexistentToken",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  { type: "error", name: "EndorsementExpired", inputs: [] },
  { type: "error", name: "InvalidExpiry", inputs: [] },
  { type: "error", name: "NoActiveEndorsement", inputs: [] },
  { type: "error", name: "NoRootIdentity", inputs: [] },
  { type: "error", name: "NotAdmin", inputs: [] },
  { type: "error", name: "NotHolder", inputs: [] },
  { type: "error", name: "NotToken", inputs: [] },
  { type: "error", name: "NotYourEndorsement", inputs: [] },
  { type: "error", name: "OnlyProfileSystem", inputs: [] },
  { type: "error", name: "ProfileSystemAlreadySet", inputs: [] },
  { type: "error", name: "RecipientAlreadyHasProfile", inputs: [] },
  { type: "error", name: "RootDeactivated", inputs: [] },
  { type: "error", name: "RootNonTransferable", inputs: [] },
  { type: "error", name: "SelfTransfer", inputs: [] },
  { type: "error", name: "TokenExpired", inputs: [] },
  { type: "error", name: "UseTransferToken", inputs: [] },
  { type: "error", name: "ZeroAddress", inputs: [] },
] as const;

// ProfileSystem ABI

export const PROFILE_SYSTEM_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_identitySystem",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createProfile",
    inputs: [
      {
        name: "data",
        type: "tuple",
        internalType: "struct DataTypes.ProfileMetadata",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "username", type: "string", internalType: "string" },
          { name: "age", type: "uint256", internalType: "uint256" },
          {
            name: "nationality",
            type: "string",
            internalType: "string",
          },
          { name: "github", type: "string", internalType: "string" },
          { name: "email", type: "string", internalType: "string" },
          { name: "discord", type: "string", internalType: "string" },
          { name: "xDotCom", type: "string", internalType: "string" },
          {
            name: "websitePortfolioLink",
            type: "string",
            internalType: "string",
          },
          { name: "ens", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getProfile",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct DataTypes.ProfileMetadata",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "username", type: "string", internalType: "string" },
          { name: "age", type: "uint256", internalType: "uint256" },
          {
            name: "nationality",
            type: "string",
            internalType: "string",
          },
          { name: "github", type: "string", internalType: "string" },
          { name: "email", type: "string", internalType: "string" },
          { name: "discord", type: "string", internalType: "string" },
          { name: "xDotCom", type: "string", internalType: "string" },
          {
            name: "websitePortfolioLink",
            type: "string",
            internalType: "string",
          },
          { name: "ens", type: "string", internalType: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasMintedProfile",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "identitySystem",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IIdentitySystem",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "profiles",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "username", type: "string", internalType: "string" },
      { name: "age", type: "uint256", internalType: "uint256" },
      { name: "nationality", type: "string", internalType: "string" },
      { name: "github", type: "string", internalType: "string" },
      { name: "email", type: "string", internalType: "string" },
      { name: "discord", type: "string", internalType: "string" },
      { name: "xDotCom", type: "string", internalType: "string" },
      {
        name: "websitePortfolioLink",
        type: "string",
        internalType: "string",
      },
      { name: "ens", type: "string", internalType: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usernameTaken",
    inputs: [{ name: "", type: "string", internalType: "string" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usernameToProfileTokenId",
    inputs: [{ name: "", type: "string", internalType: "string" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ProfileCreated",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "username",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  // Errors
  { type: "error", name: "AlreadyMintedProfile", inputs: [] },
  { type: "error", name: "InvalidProfileUsernameChar", inputs: [] },
  { type: "error", name: "ProfileNameRequired", inputs: [] },
  { type: "error", name: "ProfileUsernameTaken", inputs: [] },
  { type: "error", name: "ProfileUsernameTooLong", inputs: [] },
  { type: "error", name: "ProfileUsernameTooShort", inputs: [] },
] as const;
