"use client";

import { useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toHex, type ContractFunctionParameters } from "viem";
import {
  IDENTITY_SYSTEM_ADDRESS,
  IDENTITY_SYSTEM_ABI,
  PROFILE_SYSTEM_ADDRESS,
  PROFILE_SYSTEM_ABI,
  type ProfileMetadata,
} from "@/lib/contracts";
import { donationAmount } from "@/lib/devFee";
import type { FieldUpdate, LinkUpdate } from "@/lib/profileData";
import { useDevFee } from "@/hooks/useIdentityReads";

/**
 * The optional donation to AOSSIE for one call: its estimated gas fee times the
 * devFee percentage. Nothing is donated when the box is unticked, when devFee
 * has not loaded, or when the estimate fails (the wallet then reports why).
 */
function useDonation(chainId?: number) {
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { data: devFee } = useDevFee(chainId);
  const [isPreparing, setIsPreparing] = useState(false);

  const donationFor = async (
    call: ContractFunctionParameters,
    donate: boolean
  ): Promise<bigint | undefined> => {
    if (!donate || !devFee || !publicClient || !address) return undefined;

    setIsPreparing(true);
    try {
      const [gas, gasPrice] = await Promise.all([
        publicClient.estimateContractGas({ ...call, account: address }),
        // eth_gasPrice works with and without EIP-1559 (Ethereum Classic has none)
        publicClient.getGasPrice(),
      ]);
      return donationAmount(gas, gasPrice, devFee);
    } catch {
      return undefined;
    } finally {
      setIsPreparing(false);
    }
  };

  return { donationFor, isPreparing };
}

// IdentitySystem Writes

/** Create a root identity (auto-called before first action if needed) */
export function useCreateRootIdentity({ chainId }: { chainId?: number } = {}) {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation(chainId);

  // A reverted transaction fails here, not at send time, so this error has to
  // be surfaced too or the modal confirms forever.
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash, chainId });

  const write = async (displayName: string, donate: boolean) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "createRootIdentity",
      args: [displayName],
    } as const;
    writeContract({ ...call, chainId, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error: error ?? receiptError,
    reset,
  };
}

/** Create a new identity token */
export function useCreateToken() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = async (
    params: {
      tokenName: string;
      tokenType: string;
      tokenValue: string;
      about: string;
      validUntil: bigint;
    },
    donate: boolean
  ) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "createToken",
      args: [
        params.tokenName,
        params.tokenType,
        toHex(params.tokenValue),
        params.about,
        params.validUntil,
      ],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error,
    reset,
  };
}

/** Attest a token with a user-selected duration (in seconds) */
export function useAttestToken() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = async (
    tokenId: bigint,
    durationSeconds: bigint,
    donate: boolean
  ) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "attestToken",
      args: [tokenId, durationSeconds],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error,
    reset,
  };
}

/** Revoke your active attestation on a token */
export function useRevokeAttestation() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = async (tokenId: bigint, donate: boolean) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "revokeAttestation",
      args: [tokenId],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error,
    reset,
  };
}

/** Flag a token */
export function useFlagToken() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = async (tokenId: bigint, donate: boolean) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "flagToken",
      args: [tokenId],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error,
    reset,
  };
}

/** Burn (permanently destroy) a token */
export function useBurnToken() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = async (tokenId: bigint, donate: boolean) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "burnToken",
      args: [tokenId],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error,
    reset,
  };
}

/** Transfer a token to another wallet */
export function useTransferToken() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = async (
    tokenId: bigint,
    sendingTo: `0x${string}`,
    donate: boolean
  ) => {
    const call = {
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      functionName: "transferToken",
      args: [tokenId, sendingTo],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error,
    reset,
  };
}

// ProfileSystem Writes

/** Create a profile (calls ProfileSystem which internally mints via IdentitySystem) */
export function useCreateProfile() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  // A reverted transaction fails here, not at send time, so surface it too.
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const write = async (
    data: ProfileMetadata,
    links: LinkUpdate[],
    donate: boolean
  ) => {
    const call = {
      address: PROFILE_SYSTEM_ADDRESS,
      abi: PROFILE_SYSTEM_ABI,
      functionName: "createProfile",
      args: [data, links],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error: error ?? receiptError,
    reset,
  };
}

/** Edit a profile — only the given fields and links are written */
export function useUpdateProfile() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { donationFor, isPreparing } = useDonation();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const write = async (
    tokenId: bigint,
    fields: FieldUpdate[],
    links: LinkUpdate[],
    donate: boolean
  ) => {
    const call = {
      address: PROFILE_SYSTEM_ADDRESS,
      abi: PROFILE_SYSTEM_ABI,
      functionName: "updateProfile",
      args: [tokenId, fields, links],
    } as const;
    writeContract({ ...call, value: await donationFor(call, donate) });
  };

  return {
    write,
    txHash,
    isPending: isPreparing || isPending,
    isConfirming,
    isSuccess,
    isLoading: isPreparing || isPending || isConfirming,
    error: error ?? receiptError,
    reset,
  };
}

// Dev fee Writes (only the dev wallet, or the proposed dev for acceptDev)

type DevFeeCall =
  | { functionName: "withdrawDevFees" }
  | { functionName: "setDevFee"; args: readonly [bigint] }
  | { functionName: "setDevFeeReceiver"; args: readonly [`0x${string}`] }
  | { functionName: "proposeDev"; args: readonly [`0x${string}`] }
  | { functionName: "acceptDev" };

/** One dev action at a time; `functionName` says which one the status is for */
export function useDevFeeWrite() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
    variables,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const write = (call: DevFeeCall) => {
    writeContract({
      address: IDENTITY_SYSTEM_ADDRESS,
      abi: IDENTITY_SYSTEM_ABI,
      ...call,
    });
  };

  return {
    write,
    functionName: variables?.functionName as
      | DevFeeCall["functionName"]
      | undefined,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error: error ?? receiptError,
    reset,
  };
}
