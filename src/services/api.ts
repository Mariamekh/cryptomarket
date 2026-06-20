import type { Coin, MarketResult } from "../types/market";
import { generateMockMarket } from "./mockData";

const MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd&order=market_cap_desc&per_page=100&page=1" +
  "&sparkline=true&price_change_percentage=1h,24h,7d";

export const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export class RateLimitError extends Error {
  constructor() {
    super("CoinGecko rate limit reached (HTTP 429).");
    this.name = "RateLimitError";
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockMarket(): Promise<MarketResult> {
  await delay(400);
  return { coins: generateMockMarket(), source: "mock" };
}

async function fetchLiveMarket(signal?: AbortSignal): Promise<MarketResult> {
  const res = await fetch(MARKETS_URL, {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);

  const data = (await res.json()) as Coin[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Unexpected response shape from CoinGecko.");
  }
  return { coins: data, source: "live" };
}

export function fetchMarket(
  source: "live" | "mock",
  signal?: AbortSignal,
): Promise<MarketResult> {
  if (source === "mock" || FORCE_MOCK) return fetchMockMarket();
  return fetchLiveMarket(signal);
}
