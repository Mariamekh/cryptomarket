import type { Coin } from "../types/market";

export type SortKey =
  | "market_cap_rank"
  | "current_price"
  | "price_change_percentage_1h_in_currency"
  | "price_change_percentage_24h_in_currency"
  | "price_change_percentage_7d_in_currency"
  | "market_cap"
  | "total_volume"
  | "name";

export type SortDir = "asc" | "desc";

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

const ASCENDING_FIRST: ReadonlySet<SortKey> = new Set(["name", "market_cap_rank"]);

export function nextSortState(current: SortState, key: SortKey): SortState {
  if (current.key === key) {
    return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { key, dir: ASCENDING_FIRST.has(key) ? "asc" : "desc" };
}

export function filterCoins(coins: Coin[], query: string): Coin[] {
  const q = query.trim().toLowerCase();
  if (!q) return coins;
  return coins.filter(
    (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
  );
}

export function sortCoins(coins: Coin[], sort: SortState): Coin[] {
  const { key, dir } = sort;
  const factor = dir === "asc" ? 1 : -1;
  return [...coins].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const aMissing = av == null;
    const bMissing = bv == null;
    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * factor;
    }
    return ((av as number) - (bv as number)) * factor;
  });
}

export interface TopMovers {
  gainers: Coin[];
  losers: Coin[];
}

export function getTopMovers(coins: Coin[], n = 5): TopMovers {
  const withChange = coins.filter(
    (c) => c.price_change_percentage_24h_in_currency != null,
  );
  const byChangeDesc = [...withChange].sort(
    (a, b) =>
      (b.price_change_percentage_24h_in_currency as number) -
      (a.price_change_percentage_24h_in_currency as number),
  );
  const gainers = byChangeDesc
    .filter((c) => (c.price_change_percentage_24h_in_currency as number) > 0)
    .slice(0, n);
  const losers = byChangeDesc
    .filter((c) => (c.price_change_percentage_24h_in_currency as number) < 0)
    .slice(-n)
    .reverse();
  return { gainers, losers };
}
