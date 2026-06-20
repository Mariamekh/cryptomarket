import type { ReactNode } from "react";
import type { Coin } from "../types/market";
import { formatCompact, formatNumber, formatPrice } from "../lib/format";
import { PercentChange } from "./PercentChange";
import { Sparkline } from "./Sparkline";

interface Props {
  coin: Coin;
}

// Too small to move out, maybe move out if becomes bigger
function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{children}</span>
    </div>
  );
}

export function RowDetail({ coin }: Props) {
  return (
    <div className="row-detail">
      <div className="row-detail-chart">
        <div className="row-detail-chart-head">
          <span>7-day price</span>
          <PercentChange value={coin.price_change_percentage_7d_in_currency} showArrow />
        </div>
        <Sparkline
          data={coin.sparkline_in_7d?.price ?? []}
          width={420}
          height={90}
          strokeWidth={2}
        />
      </div>

      <div className="row-detail-stats">
        <Stat label="Market cap">{formatCompact(coin.market_cap)}</Stat>
        <Stat label="24h volume">{formatCompact(coin.total_volume)}</Stat>
        <Stat label="24h high">{formatPrice(coin.high_24h)}</Stat>
        <Stat label="24h low">{formatPrice(coin.low_24h)}</Stat>
        <Stat label="Circulating">
          {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}
        </Stat>
        <Stat label="All-time high">{formatPrice(coin.ath)}</Stat>
      </div>
    </div>
  );
}
