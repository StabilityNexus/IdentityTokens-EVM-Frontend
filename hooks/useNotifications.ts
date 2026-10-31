"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import {
  DEPLOY_BLOCKS,
  IDENTITY_SYSTEM_ABI,
  IDENTITY_SYSTEM_ADDRESS,
} from "@/lib/contracts";
import {
  classify,
  fromAttestations,
  loadState,
  MAX_STORED,
  mergeItems,
  saveState,
  scanLogs,
  storageKey,
  touchesWallet,
  unreadCount,
  type AppNotification,
  type ContractLog,
  type NotificationState,
  type WalletContext,
} from "@/lib/notifications";
import { useMultipleTokenDetails } from "./useIdentityReads";
import { useNotificationContext } from "./useNotificationContext";
import { useTokenAttesters } from "./useTokenAttesters";
import type { TokenTuple } from "./useWalletTokenList";

type Client = NonNullable<ReturnType<typeof usePublicClient>>;

/** Two or three blocks; notifications can wait that long. Pauses while the tab is hidden. */
const POLL_MS = 30_000;
/** The first `getLogs` range of every scan; it halves while the RPC rejects it. */
const START_RANGE = 10_000n;
/** `getLogs` requests per scan; past it, the oldest blocks are skipped. */
const REQUEST_BUDGET = 50;
/** Blocks fetched at once for timestamps, to stay under RPC rate limits. */
const BLOCK_BATCH = 10;

/** Every IdentitySystem log in a block range. */
function getLogs(
  client: Client,
  fromBlock: bigint,
  toBlock: bigint
): Promise<ContractLog[]> {
  return client.getContractEvents({
    address: IDENTITY_SYSTEM_ADDRESS,
    abi: IDENTITY_SYSTEM_ABI,
    fromBlock,
    toBlock,
  });
}

/** Unix seconds of each log's block, read from the log when the RPC includes it. */
async function blockTimes(
  client: Client,
  logs: readonly ContractLog[]
): Promise<Map<bigint, number>> {
  const times = new Map<bigint, number>();
  for (const log of logs) {
    if (log.blockTimestamp !== undefined) {
      times.set(log.blockNumber, Number(log.blockTimestamp));
    }
  }
  const missing = [...new Set(logs.map((log) => log.blockNumber))].filter(
    (n) => !times.has(n)
  );
  for (let i = 0; i < missing.length; i += BLOCK_BATCH) {
    await Promise.all(
      missing.slice(i, i + BLOCK_BATCH).map(async (blockNumber) => {
        const block = await client.getBlock({ blockNumber });
        times.set(blockNumber, Number(block.timestamp));
      })
    );
  }
  return times;
}

/**
 * Scans the blocks since the stored cursor, saves the notifications found and
 * returns the new state. Calls `onWalletChange` when a log shows the wallet's
 * reads are stale.
 */
async function scanNotifications(
  client: Client,
  key: string,
  deployBlock: bigint,
  context: WalletContext,
  onWalletChange: () => void
): Promise<NotificationState> {
  const state = loadState(key);
  const isFirstScan = state.cursor === null;
  const latest = await client.getBlockNumber();
  const from = state.cursor ? BigInt(state.cursor) + 1n : deployBlock;
  if (from > latest) return state;

  const { logs, skippedTo } = await scanLogs(
    (start, end) => getLogs(client, start, end),
    from,
    latest,
    { range: START_RANGE, budget: REQUEST_BUDGET }
  );
  // The wallet's reads loaded just before the first scan, so they're current.
  if (!isFirstScan && logs.some((log) => touchesWallet(log, context))) {
    onWalletChange();
  }

  // Only the newest MAX_STORED are kept, so only those need a timestamp.
  const found = logs
    .flatMap((log) => {
      const item = classify(log, context);
      return item ? [{ log, item }] : [];
    })
    .slice(-MAX_STORED);
  const times = await blockTimes(
    client,
    found.map((entry) => entry.log)
  );
  const items: AppNotification[] = found.map(({ log, item }) => ({
    ...item,
    at: times.get(log.blockNumber) ?? 0,
  }));

  // A catch-up that ran out of budget leaves a row where the skipped blocks
  // end. A first visit counts all history as read, so it leaves none.
  if (!isFirstScan && skippedTo !== null) {
    const block = await client.getBlock({ blockNumber: skippedTo });
    items.push({
      id: `gap:${skippedTo}`,
      kind: "gap",
      at: Number(block.timestamp),
    });
  }

  return saveState(key, { cursor: latest.toString(), items });
}

/**
 * The bell's notifications for the connected wallet on the current chain:
 * attestations from contract state, everything else from IdentitySystem logs,
 * polled while the app is open. Global notices show without a wallet too.
 */
export function useNotifications() {
  const { address } = useAccount();
  const client = usePublicClient();
  const queryClient = useQueryClient();
  const wallet = useNotificationContext(address);
  const attesters = useTokenAttesters(wallet.walletTokenIds, {
    includeProfile: true,
  });

  const chainId = client?.chain.id;
  // Undefined on chains without the contract, which have nothing to scan.
  const deployBlock =
    chainId === undefined ? undefined : DEPLOY_BLOCKS[chainId];
  const key =
    chainId === undefined
      ? undefined
      : storageKey(chainId, IDENTITY_SYSTEM_ADDRESS, address);
  const queryKey = useMemo(() => ["notifications", key], [key]);

  const scan = useQuery({
    queryKey,
    enabled: !!client && !!key && deployBlock !== undefined && wallet.isReady,
    refetchInterval: POLL_MS,
    queryFn: () => {
      if (!client || !key || deployBlock === undefined) {
        throw new Error("No client");
      }
      return scanNotifications(
        client,
        key,
        deployBlock,
        wallet.context,
        wallet.refresh
      );
    },
  });

  // Log items carry token ids only; fill in names with one multicall.
  const tokenIds = useMemo(
    () => [
      ...new Set(
        (scan.data?.items ?? []).flatMap((item) =>
          item.tokenId ? [BigInt(item.tokenId)] : []
        )
      ),
    ],
    [scan.data?.items]
  );
  const details = useMultipleTokenDetails(
    tokenIds.length > 0 ? tokenIds : undefined
  );

  const items = useMemo<AppNotification[]>(() => {
    const names = new Map(
      tokenIds.map((id, i) => {
        const detail = details.data?.[i];
        const name =
          detail?.status === "success" ? (detail.result as TokenTuple)[2] : "";
        return [id.toString(), name];
      })
    );
    const logItems = (scan.data?.items ?? []).map((item) =>
      item.tokenId
        ? { ...item, tokenName: names.get(item.tokenId) || undefined }
        : item
    );
    return mergeItems(
      logItems,
      fromAttestations(attesters.attesters, logItems)
    );
  }, [scan.data?.items, tokenIds, details.data, attesters.attesters]);
  const newestAt = items[0]?.at ?? 0;

  const setLastReadAt = useCallback(
    (at: number) => {
      if (!key) return;
      queryClient.setQueryData(queryKey, saveState(key, { lastReadAt: at }));
    },
    [key, queryClient, queryKey]
  );

  // First load on this device: everything already there counts as read.
  const isBaselineReady =
    scan.isSuccess && wallet.isReady && (!address || !attesters.isLoading);
  const needsBaseline = scan.data?.lastReadAt === null;
  useEffect(() => {
    if (isBaselineReady && needsBaseline) setLastReadAt(newestAt);
  }, [isBaselineReady, needsBaseline, newestAt, setLastReadAt]);

  const isError = (scan.isError && !scan.data) || wallet.isError;

  return {
    items,
    unread: unreadCount(items, scan.data?.lastReadAt ?? null),
    isLoading: deployBlock !== undefined && !scan.data && !isError,
    isError,
    isConnected: !!address,
    markRead: () => setLastReadAt(newestAt),
    retry: () => {
      wallet.refresh();
      scan.refetch();
    },
  };
}
