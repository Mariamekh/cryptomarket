import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Coin } from "../types/market";
import type { SortKey, SortState } from "../lib/market";
import { MarketRow } from "./MarketRow";
import { RowDetail } from "./RowDetail";
import { TableHeader } from "./TableHeader";

interface Props {
  coins: Coin[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  expandedId: string | null;
  onToggle: (id: string) => void;
}

const ROW_HEIGHT = 56;

export function MarketTable({ coins, sort, onSort, expandedId, onToggle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: coins.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => coins[index]?.id ?? index,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="market-table-wrap">
      <div className="market-table">
        <TableHeader sort={sort} onSort={onSort} />
        <div ref={scrollRef} className="market-scroll" role="rowgroup">
          <div className="virtual-canvas" style={{ height: virtualizer.getTotalSize() }}>
            {items.map((vi) => {
              const coin = coins[vi.index];
              if (!coin) return null;
              const isExpanded = coin.id === expandedId;
              return (
                <div
                  key={vi.key}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  className="virtual-item"
                  style={{ transform: `translateY(${vi.start}px)` }}
                >
                  <MarketRow coin={coin} isExpanded={isExpanded} onToggle={onToggle} />
                  {isExpanded && <RowDetail coin={coin} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
