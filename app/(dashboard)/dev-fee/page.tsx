"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther, isAddress, zeroAddress } from "viem";
import { useDevFeeConfig, useDevFeesWaiting } from "@/hooks/useIdentityReads";
import { useDevFeeWrite } from "@/hooks/useIdentityWrites";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import { parseDevFeeInput } from "@/lib/devFee";
import { getEtherscanAddressUrl } from "@/lib/errors";
import { truncateAddress } from "@/lib/helpers";
import { TxStatus } from "@/lib/types";

const INPUT_CLASS =
  "w-full rounded-lg border border-white/8 bg-modal-inner-bg px-4 py-2 font-utsaha text-white placeholder-gray-500 transition-all focus:ring-1 focus:ring-brand-blue focus:outline-none disabled:opacity-50";
const BUTTON_CLASS =
  "shrink-0 rounded-lg bg-brand-blue px-4 py-2 font-utsaha text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

/** The dev wallet's controls for the donations to AOSSIE; the sidebar links it only for that wallet. */
export default function DevFeePage() {
  const { address, isConnected } = useAccount();
  const config = useDevFeeConfig();
  const waiting = useDevFeesWaiting();
  const tx = useDevFeeWrite();

  const [feeInput, setFeeInput] = useState("");
  const [receiverInput, setReceiverInput] = useState("");
  const [newDevInput, setNewDevInput] = useState("");

  // Show the new settings and balances once an action lands
  useEffect(() => {
    if (!tx.isSuccess) return;
    config.refetch();
    waiting.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess]);

  const txStatus: TxStatus = tx.isPending
    ? "pending"
    : tx.isConfirming
      ? "confirming"
      : tx.isSuccess
        ? "success"
        : tx.error
          ? "error"
          : "idle";

  /** The status line, shown under the section whose action sent it */
  const statusFor = (...names: string[]) =>
    tx.functionName && names.includes(tx.functionName) ? (
      <TransactionStatus
        status={txStatus}
        txHash={tx.txHash}
        error={tx.error}
      />
    ) : null;

  const feeResult = feeInput.trim()
    ? parseDevFeeInput(feeInput, config.maxDevFee ?? 0n)
    : undefined;
  const isReceiverValid =
    isAddress(receiverInput) && receiverInput !== zeroAddress;
  const isNewDevValid = isAddress(newDevInput) && newDevInput !== zeroAddress;

  const renderBody = () => {
    if (!isConnected) {
      return (
        <p className="font-utsaha text-gray-400">
          Connect the dev wallet to manage the donations to AOSSIE.
        </p>
      );
    }
    if (config.isLoading) {
      return <p className="font-utsaha text-gray-400">Checking this wallet…</p>;
    }

    if (!config.isDev && config.isPendingDev) {
      return (
        <Section
          title="You've been proposed as the new dev"
          description={`Accepting makes this wallet the dev for both DIT contracts. The current dev${
            config.dev ? `, ${truncateAddress(config.dev)},` : ""
          } loses access.`}
        >
          <button
            type="button"
            disabled={tx.isLoading}
            onClick={() => tx.write({ functionName: "acceptDev" })}
            className={`${BUTTON_CLASS} w-fit`}
          >
            Accept
          </button>
          {statusFor("acceptDev")}
        </Section>
      );
    }

    if (!config.isDev) {
      return (
        <p className="font-utsaha text-gray-400">
          This page is for the DIT dev wallet.{" "}
          {address ? truncateAddress(address) : "This wallet"} isn&rsquo;t the
          dev or a proposed dev.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Donations waiting">
            {waiting.value !== undefined
              ? `${formatEther(waiting.value)} ${waiting.symbol ?? ""}`
              : "…"}
          </Field>
          <Field label="Donation">
            {config.devFee !== undefined
              ? config.devFee === 0n
                ? "Off"
                : `${config.devFee}% of each transaction's network fee`
              : "…"}
          </Field>
          <Field label="Receiver">
            <AddressLink address={config.devFeeReceiver} />
          </Field>
          <Field label="Dev">
            <AddressLink address={config.dev} />
          </Field>
        </div>

        <Section
          title="Withdraw"
          description="Sends everything waiting in both DIT contracts to the receiver, in one transaction."
        >
          <button
            type="button"
            disabled={tx.isLoading || !waiting.value}
            onClick={() => tx.write({ functionName: "withdrawDevFees" })}
            className="w-fit rounded-lg bg-brand-green px-4 py-2 font-utsaha text-black transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Withdraw
          </button>
          {statusFor("withdrawDevFees")}
        </Section>

        <Section
          title="Donation amount"
          description={`A percentage of each transaction's network fee, so it follows gas prices by itself. 100 makes the donation equal to the fee; 0 turns donations off. At most ${config.maxDevFee ?? "…"}%.`}
        >
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (feeResult && "value" in feeResult) {
                tx.write({
                  functionName: "setDevFee",
                  args: [feeResult.value],
                });
              }
            }}
          >
            <input
              inputMode="numeric"
              value={feeInput}
              onChange={(event) => setFeeInput(event.target.value)}
              placeholder={config.devFee?.toString() ?? "100"}
              aria-label="Donation as a percentage of the network fee"
              disabled={tx.isLoading}
              className={INPUT_CLASS}
            />
            <span className="font-utsaha text-sm text-gray-400">%</span>
            <button
              type="submit"
              disabled={tx.isLoading || !feeResult || "error" in feeResult}
              className={BUTTON_CLASS}
            >
              Save
            </button>
          </form>
          {feeResult && "error" in feeResult && (
            <span className="font-utsaha text-xs text-red-400">
              {feeResult.error}
            </span>
          )}
          {statusFor("setDevFee")}
        </Section>

        <Section
          title="Receiver"
          description="Where withdrawals go. Withdraw first if the donations already waiting should go to the current receiver."
        >
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (isReceiverValid) {
                tx.write({
                  functionName: "setDevFeeReceiver",
                  args: [receiverInput as `0x${string}`],
                });
              }
            }}
          >
            <input
              value={receiverInput}
              onChange={(event) => setReceiverInput(event.target.value.trim())}
              placeholder="0x…"
              aria-label="New receiver address"
              disabled={tx.isLoading}
              className={`${INPUT_CLASS} font-mono text-sm`}
            />
            <button
              type="submit"
              disabled={tx.isLoading || !isReceiverValid}
              className={BUTTON_CLASS}
            >
              Save
            </button>
          </form>
          {statusFor("setDevFeeReceiver")}
        </Section>

        <Section
          title="Hand over the dev role"
          description="Two steps: propose a wallet here, then open this page with that wallet and accept. You stay the dev until it accepts."
        >
          {config.pendingDev && (
            <div className="flex flex-wrap items-center gap-2 font-utsaha text-sm text-gray-300">
              Proposed: <AddressLink address={config.pendingDev} />
              <button
                type="button"
                disabled={tx.isLoading}
                onClick={() =>
                  tx.write({ functionName: "proposeDev", args: [zeroAddress] })
                }
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 font-utsaha text-xs text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (isNewDevValid) {
                tx.write({
                  functionName: "proposeDev",
                  args: [newDevInput as `0x${string}`],
                });
              }
            }}
          >
            <input
              value={newDevInput}
              onChange={(event) => setNewDevInput(event.target.value.trim())}
              placeholder="0x…"
              aria-label="Wallet to propose as the new dev"
              disabled={tx.isLoading}
              className={`${INPUT_CLASS} font-mono text-sm`}
            />
            <button
              type="submit"
              disabled={tx.isLoading || !isNewDevValid}
              className={BUTTON_CLASS}
            >
              Propose
            </button>
          </form>
          {statusFor("proposeDev")}
        </Section>
      </div>
    );
  };

  return (
    <main className="flex flex-col gap-6 px-4 pt-9 pb-12 sm:px-6 md:pr-14 md:pl-10">
      <div className="w-full overflow-hidden rounded-2xl border border-card-border bg-card-bg p-6">
        <h2 className="mb-4 font-utsaha text-xl text-white md:text-2xl">
          Dev fee
        </h2>
        {renderBody()}
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-white/5 pt-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-utsaha text-lg text-gray-300">{title}</h3>
        <p className="font-utsaha text-sm text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-utsaha text-xs text-gray-500">{label}</span>
      <span className="font-utsaha text-sm break-all text-white">
        {children}
      </span>
    </div>
  );
}

function AddressLink({ address }: { address?: `0x${string}` }) {
  if (!address) return <>…</>;
  return (
    <a
      href={getEtherscanAddressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-sm break-all text-brand-blue-link underline-offset-2 hover:underline"
    >
      {address}
    </a>
  );
}
