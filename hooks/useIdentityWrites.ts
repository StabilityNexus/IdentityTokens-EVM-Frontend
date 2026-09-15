"use client";

import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toHex } from "viem";
import {
  getContractAddresses,
  IDENTITY_SYSTEM_ABI,
  PROFILE_SYSTEM_ABI,
} from "@/lib/contracts";

// IdentitySystem Writes

/** Create a root identity (auto-called before first action if needed) */
export function useCreateRootIdentity() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (displayName: string) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "createRootIdentity",
      args: [displayName],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

/** Create a new identity token */
export function useCreateToken() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (params: {
    tokenName: string;
    tokenType: string;
    tokenValue: string;
    about: string;
    validUntil: bigint;
  }) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "createToken",
      args: [
        params.tokenName,
        params.tokenType,
        toHex(params.tokenValue),
        params.about,
        params.validUntil,
      ],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

/** Attest a token with a user-selected duration (in seconds) */
export function useAttestToken() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (tokenId: bigint, durationSeconds: bigint) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "attestToken",
      args: [tokenId, durationSeconds],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

/** Revoke your active attestation on a token */
export function useRevokeAttestation() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (tokenId: bigint) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "revokeAttestation",
      args: [tokenId],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

/** Flag a token */
export function useFlagToken() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (tokenId: bigint) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "flagToken",
      args: [tokenId],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

/** Burn (permanently destroy) a token */
export function useBurnToken() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (tokenId: bigint) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "burnToken",
      args: [tokenId],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

/** Transfer a token to another wallet */
export function useTransferToken() {
  const { identitySystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (tokenId: bigint, sendingTo: `0x${string}`) => {
    writeContract({
      address: identitySystem,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "transferToken",
      args: [tokenId, sendingTo],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}

// ProfileSystem Writes

/** Create a profile (calls ProfileSystem which internally mints via IdentitySystem) */
export function useCreateProfile() {
  const { profileSystem } = getContractAddresses(useChainId());
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = (data: {
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
  }) => {
    writeContract({
      address: profileSystem,
      abi: PROFILE_SYSTEM_ABI,
      functionName: "createProfile",
      args: [data],
    });
  };

  return {
    write,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error,
    reset,
  };
}
