"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { Fingerprint, Flag, Hash, MoreVertical, UserRound } from "lucide-react";
import { SearchBar } from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttestModal } from "@/components/forms/AttestModal";
import { useHasAttested, useRootId } from "@/hooks/useIdentityReads";
import { useFlagToken, useRevokeAttestation } from "@/hooks/useIdentityWrites";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { getContractErrorMessage } from "@/lib/errors";
import { truncateAddress } from "@/lib/helpers";
import { searchEntries, type SearchEntry, type SearchType } from "@/lib/search";
import { formatTokenId } from "@/lib/tokenId";

const TYPES: { key: SearchType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "token", label: "Token" },
  { key: "profile", label: "Profile" },
  { key: "id", label: "ID" },
  { key: "username", label: "Username" },
];

const PREFIX_TYPE: Record<string, SearchType> = {
  id: "id",
  tk: "token",
  pf: "profile",
};

const SEARCH_DEBOUNCE_MS = 350;

const typeOfPrefix = (q: string) =>
  PREFIX_TYPE[/^(id|tk|pf)-/i.exec(q.trim())?.[1].toLowerCase() ?? ""];

function hrefFor(entry: SearchEntry): string {
  if (entry.kind === "root") return `/wallet?u=${entry.owner}`;
  if (entry.kind === "profile") return `/profile?u=${entry.username}`;
  return `/discover?q=${formatTokenId(entry.id)}`;
}

export function GlobalSearch() {
  const router = useRouter();
  const urlQuery = useSearchParams()?.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const [settled, setSettled] = useState(urlQuery);
  const [type, setType] = useState<SearchType>("all");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Search once typing pauses, so slow and fast typists both get one lookup
  useEffect(() => {
    const timer = setTimeout(() => setSettled(draft), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      const outside =
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !rootRef.current?.contains(e.target as Node) &&
            // the ⋮ menu renders in a portal outside this tree
            !(e.target as Element).closest?.(
              "[data-radix-popper-content-wrapper]"
            );
      if (outside) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isOpen]);

  const { isConnected } = useAccount();
  const { entries, isLoading } = useSearchIndex(isOpen);
  const results = useMemo(
    () => searchEntries(entries, type, settled),
    [entries, type, settled]
  );
  const activeType = typeOfPrefix(draft) ?? type;

  const navigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const pickType = (key: SearchType) => {
    const stripped = draft.replace(/^(id|tk|pf)-/i, "");
    setType(key);
    setDraft(stripped);
    setSettled(stripped);
  };

  return (
    <div ref={rootRef} className="relative flex min-w-0 flex-1">
      <SearchBar
        placeholder="Search tokens, profiles, IDs or usernames…"
        value={draft}
        onChange={(value) => {
          setDraft(value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onSubmit={() => {
          const top = searchEntries(entries, type, draft, 1)[0];
          if (top) navigate(hrefFor(top));
        }}
      />

      {isOpen && (
        <div className="motion-safe:animate-in motion-safe:fade-in absolute top-full right-0 left-0 z-50 mt-2 rounded-2xl border border-white/6 bg-app-bg shadow-2xl motion-safe:duration-200">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
            <span className="mr-1 font-utsaha text-sm text-gray-400">
              Type:
            </span>
            {TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                aria-pressed={activeType === t.key}
                onClick={() => pickType(t.key)}
                className={`rounded-lg border border-white/8 px-3 py-1.5 font-utsaha text-sm transition-all ${
                  activeType === t.key
                    ? "bg-brand-blue text-white"
                    : "bg-modal-inner-bg text-gray-400 hover:bg-modal-border hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {settled.trim() && (
            <div className="border-t border-white/6 px-4 py-3 sm:px-5">
              <div className="mb-1 flex items-baseline justify-between">
                <p className="font-utsaha text-base text-white">Top Match</p>
                {results.length > 0 && (
                  <span className="font-utsaha text-xs text-gray-500">
                    {results.length === 50 ? "50+" : results.length} results
                  </span>
                )}
              </div>
              {results.length > 0 ? (
                <ul
                  aria-label="Search results"
                  className="max-h-[min(60vh,26rem)] overflow-y-auto"
                >
                  {results.map((entry) => (
                    <li key={`${entry.kind}:${entry.id}`}>
                      <EntryRow entry={entry} onNavigate={navigate} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {results.length > 0 && !isConnected ? (
                <Note>Connect a wallet to attest, revoke or flag.</Note>
              ) : results.length === 0 ? (
                <Note>{isLoading ? "Searching…" : "No matches"}</Note>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 py-2 font-utsaha text-sm text-gray-500">{children}</p>
  );
}

function EntryRow({
  entry,
  onNavigate,
}: {
  entry: SearchEntry;
  onNavigate: (href: string) => void;
}) {
  const id = formatTokenId(entry.id);
  const owner = entry.owner ? truncateAddress(entry.owner) : "";
  const view = () => onNavigate(hrefFor(entry));

  if (entry.kind === "root") {
    return (
      <Row
        icon={<Fingerprint size={18} />}
        title={entry.title}
        subtitle={`ID · ${id} · wallet ${owner}`}
        viewLabel="View wallet"
        onView={view}
      />
    );
  }
  return (
    <Row
      icon={
        entry.kind === "profile" ? <UserRound size={18} /> : <Hash size={18} />
      }
      title={entry.title}
      subtitle={
        entry.kind === "profile"
          ? `Profile · @${entry.username} · ${id}`
          : `Token · ${id}${owner ? ` · owner ${owner}` : ""}`
      }
      onView={view}
    >
      <MatchActions tokenId={entry.id} name={entry.title} owner={entry.owner} />
    </Row>
  );
}

function Row({
  icon,
  title,
  subtitle,
  viewLabel = "View",
  onView,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  viewLabel?: string;
  onView: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onView}
        className="flex min-w-0 items-start gap-3 text-left"
      >
        <span className="mt-0.5 shrink-0 text-gray-500">{icon}</span>
        <span className="min-w-0">
          <span className="block truncate font-utsaha text-lg leading-tight text-white">
            {title}
          </span>
          <span className="block truncate font-utsaha text-sm text-gray-500">
            {subtitle}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="px-1 font-utsaha text-xs font-bold text-brand-blue transition-colors hover:text-blue-400 sm:px-2 sm:text-sm"
        >
          {viewLabel}
        </button>
        {children}
      </div>
    </div>
  );
}

// Attest, or Revoke while the viewer's attestation is live, plus ⋮ → Flag / Report
function MatchActions({
  tokenId,
  name,
  owner,
}: {
  tokenId: bigint;
  name: string;
  owner?: string;
}) {
  const { address, isConnected } = useAccount();
  const { data: rootId } = useRootId(address);
  const { data: hasAttested, refetch: refetchAttested } = useHasAttested(
    rootId ? rootId : undefined,
    tokenId
  );
  const revoke = useRevokeAttestation();
  const flag = useFlagToken();
  const [isAttestOpen, setIsAttestOpen] = useState(false);

  useEffect(() => {
    if (!revoke.isSuccess) return;
    refetchAttested();
  }, [revoke.isSuccess, refetchAttested]);

  if (!isConnected) return null;
  if (address && owner && address.toLowerCase() === owner.toLowerCase()) {
    return <span className="font-utsaha text-xs text-gray-500">Yours</span>;
  }

  const busy = revoke.isLoading || flag.isLoading;
  const error = revoke.error ?? flag.error;
  const status = error
    ? getContractErrorMessage(error)
    : revoke.isLoading
      ? "Revoking…"
      : flag.isLoading
        ? "Flagging…"
        : revoke.isSuccess
          ? "Attestation revoked"
          : flag.isSuccess
            ? "Flagged"
            : null;

  return (
    <>
      {hasAttested ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            flag.reset();
            revoke.write(tokenId);
          }}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 font-utsaha text-xs text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          Revoke
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            revoke.reset();
            flag.reset();
            setIsAttestOpen(true);
          }}
          className="rounded-lg bg-brand-blue px-2 py-1.5 font-utsaha text-xs text-white transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          Attest
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More actions"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors outline-none hover:bg-white/5 hover:text-white"
          >
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 border-card-inner-bg bg-app-bg font-utsaha text-white"
        >
          <DropdownMenuItem
            disabled={busy || flag.isSuccess}
            onClick={() => {
              revoke.reset();
              flag.write(tokenId);
            }}
            className="cursor-pointer gap-2 text-yellow-400 hover:bg-white/10 focus:bg-white/5 focus:text-yellow-400"
          >
            <Flag size={16} />
            <span>Flag / Report</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {status && (
        <span
          className={`w-full font-utsaha text-xs sm:w-auto ${error ? "text-red-400" : "text-gray-400"}`}
        >
          {status}
        </span>
      )}

      {isAttestOpen && (
        <AttestModal
          isOpen
          onClose={() => setIsAttestOpen(false)}
          tokenId={tokenId}
          tokenName={name}
          onSuccess={() => refetchAttested()}
        />
      )}
    </>
  );
}
