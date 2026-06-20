import { memo } from "react";
import type { Coin } from "../types/market";
import { getTopMovers } from "../lib/market";
import { formatPrice } from "../lib/format";
import { PercentChange } from "./PercentChange";
import { CoinIcon } from "./CoinIcon";

interface Props {
  coins: Coin[];
  onSelect: (coin: Coin) => void;
}

function MoverCard({ coin, onSelect }: { coin: Coin; onSelect: (c: Coin) => void }) {
  return (
    <button type="button" className="mover-card" onClick={() => onSelect(coin)}>
      <CoinIcon image={coin.image} symbol={coin.symbol} size={20} />
      <span className="mover-symbol">{coin.symbol.toUpperCase()}</span>
      <span className="mover-price">{formatPrice(coin.current_price)}</span>
      <PercentChange value={coin.price_change_percentage_24h_in_currency} showArrow />
    </button>
  );
}

function TopMoversBase({ coins, onSelect }: Props) {
  const { gainers, losers } = getTopMovers(coins, 5);

  return (
    <section className="movers" aria-label="Top movers (24h)">
      <div className="movers-group">
        <h2 className="movers-title movers-title-up">Top gainers · 24h</h2>
        <div className="movers-row">
          {gainers.length === 0 && <span className="movers-empty">No gainers right now</span>}
          {gainers.map((c) => (
            <MoverCard key={c.id} coin={c} onSelect={onSelect} />
          ))}
        </div>
      </div>
      <div className="movers-group">
        <h2 className="movers-title movers-title-down">Top losers · 24h</h2>
        <div className="movers-row">
          {losers.length === 0 && <span className="movers-empty">No losers right now</span>}
          {losers.map((c) => (
            <MoverCard key={c.id} coin={c} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const TopMovers = memo(TopMoversBase);
