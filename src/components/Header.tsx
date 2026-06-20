import type { DataSource } from "../types/market";
import { LastUpdated } from "./LastUpdated";
import { useRefreshStatus } from "../hooks/useRefreshStatus";

interface Props {
  source: DataSource | undefined;
  requestedSource: DataSource;
  isFetching: boolean;
  isStale: boolean;
  dataUpdatedAt: number;
  onRefresh: () => void;
  onToggleSource: (s: DataSource) => void;
}

export function Header({
  source,
  requestedSource,
  isFetching,
  isStale,
  dataUpdatedAt,
  onRefresh,
  onToggleSource,
}: Props) {
  const effectiveSource = source ?? requestedSource;
  const refreshStatus = useRefreshStatus(isFetching, dataUpdatedAt);

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>Crypto Market</h1>
        <span className="app-subtitle">Sensemaking dashboard</span>
      </div>

      <div className="status">
        <span
          className={`source-badge source-${effectiveSource}`}
          title={
            effectiveSource === "mock"
              ? "Showing mocked data shaped like CoinGecko"
              : "Live data from CoinGecko"
          }
        >
          {effectiveSource === "mock" ? "DEMO" : "LIVE"}
        </span>

        <span className="freshness">
          {refreshStatus === "refreshing" && (
            <span className="refreshing" aria-live="polite">
              <span className="spinner" aria-hidden /> Refreshing…
            </span>
          )}
          {refreshStatus === "updated" && (
            <span className="updated-flash" aria-live="polite">
              ✓ Updated just now
            </span>
          )}
          {refreshStatus === "idle" && (
            <LastUpdated updatedAt={dataUpdatedAt} isStale={isStale} />
          )}
        </span>

        <button
          type="button"
          className="btn btn-sm"
          onClick={onRefresh}
          disabled={refreshStatus === "refreshing"}
          title="Fetch the latest market data now"
        >
          ↻ Refresh
        </button>

        <div className="source-toggle" role="group" aria-label="Data source">
          <button
            type="button"
            className={`toggle-btn${requestedSource === "live" ? " active" : ""}`}
            onClick={() => onToggleSource("live")}
          >
            Live
          </button>
          <button
            type="button"
            className={`toggle-btn${requestedSource === "mock" ? " active" : ""}`}
            onClick={() => onToggleSource("mock")}
          >
            Demo
          </button>
        </div>
      </div>
    </header>
  );
}
