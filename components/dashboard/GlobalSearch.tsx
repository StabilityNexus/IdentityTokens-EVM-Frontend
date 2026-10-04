"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { Fingerprint, Flag, Hash, MoreVertical, UserRound } from "lucide-react";
import { SearchBar } from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttestModal } from "@/components/forms/AttestModal";
import {
  useActiveAttestationCount,
  useHasAttested,
  useProfile,
  useResolveUsername,
  useRootId,
  useRootIdentityView,
  useTokenDetail,
  useTokenOwner,
} from "@/hooks/useIdentityReads";
import { useFlagToken, useRevokeAttestation } from "@/hooks/useIdentityWrites";
import type { TokenTuple } from "@/hooks/useWalletTokenList";
import { getContractErrorMessage } from "@/lib/errors";
import { truncateAddress } from "@/lib/helpers";
import { formatTokenId, parseTokenId, tokenTypeOf } from "@/lib/tokenId";
import { validateUsername } from "@/lib/validation";

type SearchType = "token" | "profile" | "id" | "username";

const TYPES: { key: SearchType; label: string; hint: string }[] = [
  {
    key: "token",
    label: "Token",
    hint: "Type the token's 10-digit number, e.g. 9321932540",
  },
  {
    key: "profile",
    label: "Profile",
    hint: "Type the profile's 10-digit number",
  },
  {
    key: "id",
    label: "ID",
    hint: "Type the 10-digit ID number or a wallet address",
  },
  { key: "username", label: "Username", hint: "Type a username, e.g. alice" },
];

// Indexed by on-chain TokenType (ROOT, SUB, PROFILE)
const TYPE_OF_ID: SearchType[] = ["id", "token", "profile"];
const KIND_OF_ID = ["root", "token", "profile"] as const;
const PREFIX = { token: "tk", profile: "pf", id: "id" } as const;

const SEARCH_DEBOUNCE_MS = 350;

type Target =
  | { kind: "token" | "profile" | "root"; id: bigint }
  | { kind: "wallet"; address: `0x${string}` }
  | { kind: "username"; username: string }
  | { kind: "hint"; message: string };

function resolve(type: SearchType, raw: string): Target | null {
  const q = raw.trim();
  if (!q) return null;

  // A full id like pf-2463525193 wins over the selected type
  const prefixed = parseTokenId(q);
  if (prefixed !== undefined) {
    return { kind: KIND_OF_ID[tokenTypeOf(prefixed)!], id: prefixed };
  }
  if (/^(id|tk|pf)-/i.test(q)) {
    return { kind: "hint", message: "IDs have 10 digits after the prefix" };
  }

  if (type === "username") {
    const username = q.replace(/^@/, "").toLowerCase();
    const check = validateUsername(username);
    return check.status === "valid"
      ? { kind: "username", username }
      : { kind: "hint", message: check.message ?? "Not a valid username" };
  }
  if (type === "id" && isAddress(q)) return { kind: "wallet", address: q };
  if (/^\d{10}$/.test(q)) {
    const id = parseTokenId(`${PREFIX[type]}-${q}`)!;
    return { kind: type === "id" ? "root" : type, id };
  }
  if (/^\d+$/.test(q)) {
    return {
      kind: "hint",
      message: `Numbers have 10 digits, ${q.length} so far`,
    };
  }
  return {
    kind: "hint",
    message:
      type === "id"
        ? "Type a 10-digit ID number or a 0x wallet address"
        : "That isn't a number. To find a person by name, pick Username",
  };
}

const plural = (n: bigint, word: string) =>
  `${n} ${word}${n === 1n ? "" : "s"}`;

function hrefFor(target: Target): string | null {
  switch (target.kind) {
    case "token":
    case "root":
      return `/discover?q=${formatTokenId(target.id)}`;
    case "profile":
      return `/profile?u=${formatTokenId(target.id)}`;
    case "username":
      return `/profile?u=${target.username}`;
    case "wallet":
      return `/wallet?u=${target.address}`;
    default:
      return null;
  }
}

export function GlobalSearch() {
  const router = useRouter();
  const urlQuery = useSearchParams()?.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const [settled, setSettled] = useState(urlQuery);
  const [type, setType] = useState<SearchType>(() => {
    const id = parseTokenId(urlQuery);
    return id === undefined ? "token" : TYPE_OF_ID[tokenTypeOf(id)!];
  });
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Look up only once typing pauses, never on every keystroke
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

  const prefixedId = parseTokenId(draft);
  const activeType =
    prefixedId === undefined ? type : TYPE_OF_ID[tokenTypeOf(prefixedId)!];
  const target = resolve(type, draft);

  const navigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const pickType = (key: SearchType) => {
    setType(key);
    setDraft((d) => d.replace(/^(id|tk|pf)-/i, ""));
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
          const href = target && hrefFor(target);
          if (href) navigate(href);
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

          <div className="border-t border-white/6 px-4 py-3 sm:px-5">
            <p className="mb-1 font-utsaha text-base text-white">Top Match</p>
            {!target ? (
              <Note>{TYPES.find((t) => t.key === activeType)!.hint}</Note>
            ) : target.kind === "hint" ? (
              <Note>{target.message}</Note>
            ) : draft !== settled ? (
              <Note>Searching…</Note>
            ) : (
              <Match
                key={`${target.kind}:${"id" in target ? target.id : "address" in target ? target.address : target.username}`}
                target={target}
                onNavigate={navigate}
              />
            )}
          </div>
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

function Match({
  target,
  onNavigate,
}: {
  target: Exclude<Target, { kind: "hint" }>;
  onNavigate: (href: string) => void;
}) {
  switch (target.kind) {
    case "token":
      return <TokenMatch id={target.id} onNavigate={onNavigate} />;
    case "profile":
      return <ProfileMatch id={target.id} onNavigate={onNavigate} />;
    case "root":
      return <RootMatch id={target.id} onNavigate={onNavigate} />;
    case "wallet":
      return <WalletMatch address={target.address} onNavigate={onNavigate} />;
    case "username":
      return (
        <UsernameMatch username={target.username} onNavigate={onNavigate} />
      );
  }
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

type MatchProps = { id: bigint; onNavigate: (href: string) => void };

function TokenMatch({ id, onNavigate }: MatchProps) {
  const { data, isLoading } = useTokenDetail(id);
  const { data: owner } = useTokenOwner(id);
  const { data: count, refetch } = useActiveAttestationCount(id);

  if (isLoading) return <Note>Searching…</Note>;
  const token = data as TokenTuple | undefined;
  // Burned or never-minted tokens read back zeroed
  if (!token || token[7] === 0n) {
    return <Note>No token {formatTokenId(id)}</Note>;
  }

  const name = token[2] || "Unnamed";
  return (
    <Row
      icon={<Hash size={18} />}
      title={name}
      subtitle={`Token · ${formatTokenId(id)} · ${plural(count ?? 0n, "attestation")}${owner ? ` · owner ${truncateAddress(owner)}` : ""}`}
      onView={() => onNavigate(`/discover?q=${formatTokenId(id)}`)}
    >
      <MatchActions tokenId={id} name={name} owner={owner} onChange={refetch} />
    </Row>
  );
}

function ProfileMatch({ id, onNavigate }: MatchProps) {
  const { data: profile, isLoading } = useProfile(id);
  const { data: owner } = useTokenOwner(id);
  const { data: count, refetch } = useActiveAttestationCount(id);

  if (isLoading) return <Note>Searching…</Note>;
  // Burned or never-minted profiles read back with an empty username
  if (!profile?.username) return <Note>No profile {formatTokenId(id)}</Note>;

  return (
    <Row
      icon={<UserRound size={18} />}
      title={profile.name}
      subtitle={`Profile · @${profile.username} · ${formatTokenId(id)} · ${plural(count ?? 0n, "attestation")}`}
      onView={() => onNavigate(`/profile?u=${profile.username}`)}
    >
      <MatchActions
        tokenId={id}
        name={profile.name}
        owner={owner}
        onChange={refetch}
      />
    </Row>
  );
}

function RootMatch({ id, onNavigate }: MatchProps) {
  const { data: root, isLoading } = useRootIdentityView(id);

  if (isLoading) return <Note>Searching…</Note>;
  if (!root || /^0x0+$/.test(root.walletAddress)) {
    return <Note>No ID {formatTokenId(id)}</Note>;
  }

  return (
    <Row
      icon={<Fingerprint size={18} />}
      title={root.displayName || "Unnamed identity"}
      subtitle={`ID · ${formatTokenId(id)} · wallet ${truncateAddress(root.walletAddress)} · ${plural(root.tokenCount, "token")}`}
      viewLabel="View wallet"
      onView={() => onNavigate(`/wallet?u=${root.walletAddress}`)}
    />
  );
}

function WalletMatch({
  address,
  onNavigate,
}: {
  address: `0x${string}`;
  onNavigate: (href: string) => void;
}) {
  const { data: rootId, isLoading } = useRootId(address);

  if (isLoading) return <Note>Searching…</Note>;
  if (!rootId) return <Note>{truncateAddress(address)} has no DIT ID yet</Note>;
  return <RootMatch id={rootId} onNavigate={onNavigate} />;
}

function UsernameMatch({
  username,
  onNavigate,
}: {
  username: string;
  onNavigate: (href: string) => void;
}) {
  const { data: id, isLoading } = useResolveUsername(username);

  if (isLoading) return <Note>Searching…</Note>;
  if (!id) return <Note>No profile named @{username}</Note>;
  return <ProfileMatch id={id} onNavigate={onNavigate} />;
}

// Attest, or Revoke while the viewer's attestation is live, plus ⋮ → Flag / Report
function MatchActions({
  tokenId,
  name,
  owner,
  onChange,
}: {
  tokenId: bigint;
  name: string;
  owner?: string;
  onChange: () => void;
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
    onChange();
  }, [revoke.isSuccess, refetchAttested, onChange]);

  if (!isConnected) {
    return (
      <span className="font-utsaha text-xs text-gray-500">
        Connect a wallet to attest
      </span>
    );
  }
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
          onSuccess={() => {
            refetchAttested();
            onChange();
          }}
        />
      )}
    </>
  );
}
