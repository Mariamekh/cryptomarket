import type { SortKey } from "../lib/market";

export interface ColumnDef {
  key: SortKey | null;
  label: string;
  align: "left" | "right";
}

export const COLUMNS: ColumnDef[] = [
  { key: "market_cap_rank", label: "#", align: "right" },
  { key: "name", label: "Coin", align: "left" },
  { key: "current_price", label: "Price", align: "right" },
  { key: "price_change_percentage_1h_in_currency", label: "1h", align: "right" },
  { key: "price_change_percentage_24h_in_currency", label: "24h", align: "right" },
  { key: "price_change_percentage_7d_in_currency", label: "7d", align: "right" },
  { key: "market_cap", label: "Market Cap", align: "right" },
  { key: null, label: "Last 7d", align: "right" },
];
