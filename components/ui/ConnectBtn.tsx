"use client";

import {
  CONNECT_BTN_LABEL,
  CONNECT_WALLET_TITLE,
  CONNECTING_LABEL,
  NO_WALLET_DETECTED_MSG,
  INSTALL_WALLET_HINT,
  DISCONNECT_LABEL,
} from "@/lib/constants";
import { WALLET_METADATA } from "@/lib/wallets";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ConnectorParams {
  ready?: boolean;
  uid?: string;
}

const getConnectorParams = (value: unknown): ConnectorParams => {
  if (typeof value !== "object" || value === null) return {};

  const record = value as Record<string, unknown>;
  return {
    ready: typeof record.ready === "boolean" ? record.ready : undefined,
    uid: typeof record.uid === "string" ? record.uid : undefined,
  };
};

function ConnectBtn() {
  const { isConnected, address, chain, chainId } = useAccount();
  const { connectors, connect, isPending, variables } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const walletTriggerRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAccountMenuOpen(false);
    setIsWalletModalOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (!isWalletModalOpen) {
      previouslyFocusedRef.current?.focus();
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : walletTriggerRef.current;

    closeButtonRef.current?.focus();
  }, [isWalletModalOpen]);

  if (!mounted) return null;

  const isUnsupported =
    isConnected && chainId && !chains.some((c) => c.id === chainId);

  // Address formatting (0x1234...abcd)
  const displayName = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const connectorMap = new Map<string, (typeof connectors)[number]>();
  for (const connector of connectors) {
    const key = `${connector.id}:${connector.name}`;
    if (!connectorMap.has(key)) {
      connectorMap.set(key, connector);
    }
  }
  const dedupedConnectors = Array.from(connectorMap.values());

  const hasNamedInjectedWallet = dedupedConnectors.some((connector) => {
    const name = connector.name.toLowerCase();
    const id = connector.id.toLowerCase();
    return name !== "injected" && id !== "injected";
  });

  const visibleConnectors = dedupedConnectors.filter((connector) => {
    if (!hasNamedInjectedWallet) return true;

    const name = connector.name.toLowerCase();
    const id = connector.id.toLowerCase();
    return name !== "injected" && id !== "injected";
  });

  const enrichedConnectors = visibleConnectors
    .map((connector) => {
      const connectorParams = getConnectorParams(connector);
      if (connectorParams.ready === false) return null;

      const meta = WALLET_METADATA[connector.id] ?? {};
      return {
        connector,
        label: meta.label ?? connector.name,
        icon: meta.icon, // SVGs should be mapped but fallback safely
        priority: meta.priority ?? 0,
        connectorParams,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.priority - a.priority);

  if (!isConnected) {
    return (
      <div className="relative">
        <motion.button
          ref={walletTriggerRef}
          onClick={() => setIsWalletModalOpen(true)}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-white shadow-md transition-shadow duration-200 hover:shadow-emerald-300/40 dark:bg-emerald-400 dark:text-black dark:hover:shadow-emerald-400/30"
        >
          {CONNECT_BTN_LABEL.connectWallet}
        </motion.button>

        <AnimatePresence>
          {isWalletModalOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsWalletModalOpen(false)}
              />
              {/* Modal */}
              <motion.div
                key="connect-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="connect-wallet-title"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-101 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2
                    id="connect-wallet-title"
                    className="text-xl font-bold text-zinc-900 dark:text-white"
                  >
                    {CONNECT_WALLET_TITLE}
                  </h2>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsWalletModalOpen(false)}
                    className="rounded-full p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid gap-3">
                  {enrichedConnectors.map(
                    ({ connector, label, icon, connectorParams }) => {
                      const varConnParams = getConnectorParams(
                        variables?.connector
                      );

                      const isDisabled =
                        connectorParams.ready === false || isPending;
                      const isThisPending =
                        isPending && varConnParams.uid === connectorParams.uid;

                      return (
                        <button
                          key={connectorParams.uid || connector.id}
                          disabled={isDisabled}
                          onClick={() => {
                            connect({ connector });
                            // Don't close immediately if pending, wait for explicit disconnect/result or let user close
                            // setIsWalletModalOpen(false);
                          }}
                          className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 font-semibold text-zinc-900 transition-all hover:border-emerald-400 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-zinc-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                              {icon ? (
                                <Image
                                  src={icon}
                                  alt={label}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="h-5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                              )}
                            </div>
                            <span className="text-base">{label}</span>
                          </div>

                          {isThisPending && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-emerald-500">
                                {CONNECTING_LABEL}
                              </span>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                            </div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
                {enrichedConnectors.length === 0 && (
                  <div className="py-6 text-center text-zinc-500 dark:text-zinc-400">
                    <p>{NO_WALLET_DETECTED_MSG}</p>
                    <p className="mt-2 text-sm">{INSTALL_WALLET_HINT}</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isUnsupported) {
    return (
      <motion.button
        onClick={() => switchChain?.({ chainId: chains[0].id })}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white shadow-md transition-shadow duration-200 hover:shadow-red-300/40 dark:bg-red-500 dark:text-white"
      >
        {CONNECT_BTN_LABEL.wrongNetwork}
      </motion.button>
    );
  }

  return (
    <div className="z-50 flex items-center gap-2 font-bold">
      <div className="relative">
        <motion.button
          onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.98 }}
          className="hidden items-center gap-1.5 rounded-xl bg-zinc-200 px-3 py-2 text-zinc-800 transition-colors duration-150 hover:bg-zinc-200 sm:flex dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        >
          <span className="hidden md:inline">{chain?.name || "Network"}</span>
          <span className="opacity-70">▾</span>
        </motion.button>
        <motion.button
          onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center rounded-xl bg-zinc-200 p-2 text-zinc-800 transition-colors duration-150 hover:bg-zinc-300 sm:hidden dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          aria-label={`Switch network, current: ${chain?.name}`}
        >
          <span className="text-xs">⛓</span>
        </motion.button>

        <AnimatePresence>
          {isNetworkMenuOpen && (
            <motion.div
              key="network-dropdown"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl bg-zinc-100 shadow-lg dark:bg-zinc-800"
            >
              {chains.map((x) => (
                <button
                  key={x.id}
                  disabled={!switchChain || x.id === chainId}
                  onClick={() => {
                    switchChain?.({ chainId: x.id });
                    setIsNetworkMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:text-white dark:hover:bg-zinc-700"
                >
                  {x.name} {x.id === chainId && "(Current)"}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Button */}
      <div className="relative">
        <motion.button
          onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-0 overflow-hidden rounded-xl bg-zinc-300 transition-colors duration-150 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <span className="px-3 py-2 text-zinc-800 dark:text-white">
            {displayName}
          </span>
          <span className="pr-2 text-black opacity-70 dark:text-white">▾</span>
        </motion.button>

        <AnimatePresence>
          {isAccountMenuOpen && (
            <motion.div
              key="account-dropdown"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 z-50 mt-2 w-full overflow-hidden rounded-xl bg-zinc-100 shadow-lg dark:bg-zinc-800"
            >
              <button
                onClick={() => {
                  disconnect();
                  setIsAccountMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-center text-sm font-semibold text-red-500 hover:bg-zinc-200 focus:outline-none dark:hover:bg-zinc-700"
              >
                {DISCONNECT_LABEL}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ConnectBtn;
