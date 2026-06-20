import { useCallback, useMemo, useState } from "react";
import { useMarketData } from "./services/useMarketData";
import type { UseMarketData } from "./services/useMarketData";
import { useDebounce } from "./hooks/useDebounce";
import { filterCoins, nextSortState, sortCoins } from "./lib/market";
import type { SortKey, SortState } from "./lib/market";
import type { Coin } from "./types/market";
import { Header } from "./components/Header";
import { TopMovers } from "./components/TopMovers";
import { SearchBar } from "./components/SearchBar";
import { MarketTable } from "./components/MarketTable";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorState } from "./components/ErrorState";

export default function App() {
  const market = useMarketData();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "market_cap_rank", dir: "asc" });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(
    () => filterCoins(market.coins, debouncedQuery),
    [market.coins, debouncedQuery],
  );
  const visible = useMemo(() => sortCoins(filtered, sort), [filtered, sort]);

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => nextSortState(prev, key));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleSelectMover = useCallback((coin: Coin) => {
    setQuery(coin.name);
    setExpandedId(coin.id);
  }, []);

  if (market.isLoading) {
    return (
      <div className="app">
        <Header {...headerProps(market)} />
        <main className="app-main">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (market.isError && market.coins.length === 0) {
    return (
      <div className="app">
        <Header {...headerProps(market)} />
        <main className="app-main">
          <ErrorState
            error={market.error}
            isRateLimited={market.isRateLimited}
            onRetry={market.refetch}
            onUseMock={() => market.setSource("mock")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header {...headerProps(market)} />
      <main className="app-main">
        {market.source === "mock" && (
          <div className="demo-banner" role="note">
            Showing <strong>demo data</strong> — mocked locally, shaped exactly like the
            CoinGecko response. Switch to <strong>Live</strong> in the header to use the real API.
          </div>
        )}

        {market.isError && market.coins.length > 0 && (
          <div className="warn-banner" role="alert">
            Couldn't refresh{market.isRateLimited ? " (rate limited)" : ""} — showing the last
            loaded data.{" "}
            <button className="link-btn" onClick={market.refetch}>
              Retry
            </button>
          </div>
        )}

        <TopMovers coins={market.coins} onSelect={handleSelectMover} />

        <SearchBar
          value={query}
          onChange={setQuery}
          resultCount={visible.length}
          total={market.coins.length}
        />

        {visible.length === 0 ? (
          <div className="empty-state">
            No coins match “{debouncedQuery}”.{" "}
            <button className="link-btn" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>
        ) : (
          <MarketTable
            coins={visible}
            sort={sort}
            onSort={handleSort}
            expandedId={expandedId}
            onToggle={handleToggle}
          />
        )}
      </main>
    </div>
  );
}

function headerProps(market: UseMarketData) {
  return {
    source: market.source,
    requestedSource: market.requestedSource,
    isFetching: market.isFetching,
    isStale: market.isStale,
    dataUpdatedAt: market.dataUpdatedAt,
    onRefresh: market.refetch,
    onToggleSource: market.setSource,
  };
}
