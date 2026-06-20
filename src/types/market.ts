export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  ath: number | null;
  atl: number | null;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  sparkline_in_7d: { price: number[] };
}

export type DataSource = "live" | "mock";

export interface MarketResult {
  coins: Coin[];
  source: DataSource;
}

export type ChangeWindow = "1h" | "24h" | "7d";

export const CHANGE_FIELD: Record<ChangeWindow, keyof Coin> = {
  "1h": "price_change_percentage_1h_in_currency",
  "24h": "price_change_percentage_24h_in_currency",
  "7d": "price_change_percentage_7d_in_currency",
};
