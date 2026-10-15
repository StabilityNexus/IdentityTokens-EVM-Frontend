// Partial matching for the global search. Keep this file free of runtime
// imports so `npm run check:search` can load it directly.

export type SearchKind = "token" | "profile" | "root";
export type SearchType = "all" | "token" | "profile" | "id" | "username";

export interface SearchEntry {
  kind: SearchKind;
  id: bigint;
  // The 10 digits after the id- / tk- / pf- prefix
  digits: string;
  title: string;
  username?: string;
  // Wallet holding the token, or the root's wallet
  owner?: string;
}

const KINDS: Record<SearchType, SearchKind[]> = {
  all: ["root", "profile", "token"],
  token: ["token"],
  profile: ["profile"],
  id: ["root"],
  username: ["profile"],
};

const PREFIX_KIND: Record<string, SearchKind> = {
  id: "root",
  tk: "token",
  pf: "profile",
};

// Digits match ids, "0x…" matches wallets, anything else matches names and usernames.
// Exact hits rank first, then prefix hits, then the rest; ties keep id order.
export function searchEntries(
  entries: SearchEntry[],
  type: SearchType,
  input: string,
  limit = 50
): SearchEntry[] {
  let q = input.trim().toLowerCase().replace(/^@/, "");
  let kinds = KINDS[type];

  const prefixed = /^(id|tk|pf)-(\d*)$/.exec(q);
  if (prefixed) {
    kinds = [PREFIX_KIND[prefixed[1]]];
    q = prefixed[2];
  }
  if (!q && !prefixed) return [];

  const fields = (e: SearchEntry): string[] =>
    /^\d*$/.test(q)
      ? [e.digits]
      : /^0x[0-9a-f]*$/.test(q)
        ? [e.owner?.toLowerCase() ?? ""]
        : type === "username"
          ? [e.username ?? ""]
          : [e.title.toLowerCase(), e.username ?? ""];

  return entries
    .filter((e) => kinds.includes(e.kind))
    .map((e) => {
      let rank = Infinity;
      for (const text of fields(e)) {
        const at = text.indexOf(q);
        if (at >= 0) rank = Math.min(rank, text === q ? 0 : at === 0 ? 1 : 2);
      }
      return { e, rank };
    })
    .filter((r) => r.rank !== Infinity)
    .sort((a, b) => a.rank - b.rank || a.e.digits.localeCompare(b.e.digits))
    .slice(0, limit)
    .map((r) => r.e);
}
