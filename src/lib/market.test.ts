import { describe, expect, it } from "vitest";
import type { Coin } from "../types/market";
import { filterCoins, getTopMovers, nextSortState, sortCoins } from "./market";

function coin(over: Partial<Coin> & { id: string }): Coin {
  return {
    id: over.id,
    symbol: over.symbol ?? over.id,
    name: over.name ?? over.id,
    image: "",
    current_price: over.current_price ?? 1,
    market_cap: over.market_cap ?? 1000,
    market_cap_rank: over.market_cap_rank ?? 1,
    total_volume: 0,
    high_24h: null,
    low_24h: null,
    circulating_supply: null,
    total_supply: null,
    ath: null,
    atl: null,
    price_change_percentage_1h_in_currency: null,
    price_change_percentage_24h_in_currency:
      over.price_change_percentage_24h_in_currency ?? null,
    price_change_percentage_7d_in_currency: null,
    sparkline_in_7d: { price: [] },
  };
}

describe("getTopMovers", () => {
  const coins = [
    coin({ id: "a", price_change_percentage_24h_in_currency: 12 }),
    coin({ id: "b", price_change_percentage_24h_in_currency: -8 }),
    coin({ id: "c", price_change_percentage_24h_in_currency: 3 }),
    coin({ id: "d", price_change_percentage_24h_in_currency: -15 }),
    coin({ id: "e", price_change_percentage_24h_in_currency: null }),
  ];

  it("returns gainers sorted high to low", () => {
    expect(getTopMovers(coins, 5).gainers.map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("returns losers worst first", () => {
    expect(getTopMovers(coins, 5).losers.map((c) => c.id)).toEqual(["d", "b"]);
  });

  it("excludes coins with no 24h value", () => {
    const { gainers, losers } = getTopMovers(coins, 5);
    expect([...gainers, ...losers].some((c) => c.id === "e")).toBe(false);
  });
});

describe("sortCoins", () => {
  const coins = [
    coin({ id: "a", current_price: 5 }),
    coin({ id: "b", current_price: 50 }),
    coin({ id: "c", current_price: 0.5 }),
  ];

  it("sorts descending by a numeric column", () => {
    const out = sortCoins(coins, { key: "current_price", dir: "desc" });
    expect(out.map((c) => c.id)).toEqual(["b", "a", "c"]);
  });

  it("keeps missing values last regardless of direction", () => {
    const withNull = [
      coin({ id: "x", price_change_percentage_24h_in_currency: 5 }),
      coin({ id: "y", price_change_percentage_24h_in_currency: null }),
      coin({ id: "z", price_change_percentage_24h_in_currency: -2 }),
    ];
    const asc = sortCoins(withNull, {
      key: "price_change_percentage_24h_in_currency",
      dir: "asc",
    });
    expect(asc.map((c) => c.id)).toEqual(["z", "x", "y"]);
    const desc = sortCoins(withNull, {
      key: "price_change_percentage_24h_in_currency",
      dir: "desc",
    });
    expect(desc.map((c) => c.id)).toEqual(["x", "z", "y"]);
  });

  it("does not mutate the input array", () => {
    const before = coins.map((c) => c.id);
    sortCoins(coins, { key: "current_price", dir: "desc" });
    expect(coins.map((c) => c.id)).toEqual(before);
  });
});

describe("nextSortState", () => {
  it("toggles direction when the key is unchanged", () => {
    expect(nextSortState({ key: "market_cap", dir: "desc" }, "market_cap")).toEqual({
      key: "market_cap",
      dir: "asc",
    });
  });

  it("defaults numeric columns to descending on first click", () => {
    expect(nextSortState({ key: "market_cap_rank", dir: "asc" }, "current_price")).toEqual({
      key: "current_price",
      dir: "desc",
    });
  });

  it("defaults name and rank to ascending", () => {
    expect(nextSortState({ key: "current_price", dir: "desc" }, "name")).toEqual({
      key: "name",
      dir: "asc",
    });
  });
});

describe("filterCoins", () => {
  const coins = [
    coin({ id: "1", name: "Bitcoin", symbol: "btc" }),
    coin({ id: "2", name: "Ethereum", symbol: "eth" }),
  ];

  it("matches by name, case-insensitively", () => {
    expect(filterCoins(coins, "bitco").map((c) => c.id)).toEqual(["1"]);
  });
  it("matches by symbol", () => {
    expect(filterCoins(coins, "ETH").map((c) => c.id)).toEqual(["2"]);
  });
  it("returns everything for an empty query", () => {
    expect(filterCoins(coins, "  ")).toHaveLength(2);
  });
});
