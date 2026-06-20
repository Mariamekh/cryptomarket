import { memo, useEffect, useRef, useState } from "react";
import type { Coin } from "../types/market";
import { formatCompact, formatPrice } from "../lib/format";
import { PercentChange } from "./PercentChange";
import { Sparkline } from "./Sparkline";
import { CoinIcon } from "./CoinIcon";

interface Props {
  coin: Coin;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

function MarketRowBase({ coin, isExpanded, onToggle }: Props) {
  const prevPrice = useRef(coin.current_price);
  const [flash, setFlash] = useState<"" | "up" | "down">("");

  useEffect(() => {
    const prev = prevPrice.current;
    if (coin.current_price !== prev) {
      setFlash(coin.current_price > prev ? "up" : "down");
      prevPrice.current = coin.current_price;
      const t = setTimeout(() => setFlash(""), 700);
      return () => clearTimeout(t);
    }
  }, [coin.current_price]);

  return (
    <div
      className={`market-grid market-row${isExpanded ? " is-expanded" : ""}`}
      role="row"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={() => onToggle(coin.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(coin.id);
        }
      }}
    >
      <span className="cell-right cell-muted">{coin.market_cap_rank ?? "—"}</span>

      <span className="cell-coin">
        <CoinIcon image={coin.image} symbol={coin.symbol} />
        <span className="coin-names">
          <span className="coin-name">{coin.name}</span>
          <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
        </span>
      </span>

      <span className={`cell-right cell-num${flash ? ` flash-${flash}` : ""}`}>
        {formatPrice(coin.current_price)}
      </span>
      <span className="cell-right">
        <PercentChange value={coin.price_change_percentage_1h_in_currency} />
      </span>
      <span className="cell-right">
        <PercentChange value={coin.price_change_percentage_24h_in_currency} />
      </span>
      <span className="cell-right">
        <PercentChange value={coin.price_change_percentage_7d_in_currency} />
      </span>
      <span className="cell-right cell-num">{formatCompact(coin.market_cap)}</span>

      <span className="cell-right cell-spark">
        <Sparkline data={coin.sparkline_in_7d?.price ?? []} />
      </span>
    </div>
  );
}

function areEqual(prev: Props, next: Props): boolean {
  if (prev.isExpanded !== next.isExpanded) return false;
  if (prev.onToggle !== next.onToggle) return false;
  const a = prev.coin;
  const b = next.coin;
  const aSpark = a.sparkline_in_7d?.price;
  const bSpark = b.sparkline_in_7d?.price;
  return (
    a.id === b.id &&
    a.current_price === b.current_price &&
    a.market_cap === b.market_cap &&
    a.market_cap_rank === b.market_cap_rank &&
    a.price_change_percentage_1h_in_currency === b.price_change_percentage_1h_in_currency &&
    a.price_change_percentage_24h_in_currency === b.price_change_percentage_24h_in_currency &&
    a.price_change_percentage_7d_in_currency === b.price_change_percentage_7d_in_currency &&
    aSpark?.length === bSpark?.length &&
    aSpark?.[aSpark.length - 1] === bSpark?.[(bSpark?.length ?? 1) - 1]
  );
}

export const MarketRow = memo(MarketRowBase, areEqual);
