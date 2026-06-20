function SkeletonRow() {
  return (
    <div className="market-grid market-row skeleton-row" aria-hidden>
      <span className="cell-right">
        <span className="sk sk-xs" />
      </span>
      <span className="cell-coin">
        <span className="sk sk-circle" />
        <span className="sk sk-md" />
      </span>
      <span className="cell-right">
        <span className="sk sk-sm" />
      </span>
      <span className="cell-right">
        <span className="sk sk-xs" />
      </span>
      <span className="cell-right">
        <span className="sk sk-xs" />
      </span>
      <span className="cell-right">
        <span className="sk sk-xs" />
      </span>
      <span className="cell-right">
        <span className="sk sk-sm" />
      </span>
      <span className="cell-right">
        <span className="sk sk-spark" />
      </span>
    </div>
  );
}

export function LoadingSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div className="loading" aria-busy="true" aria-label="Loading market data">
      <div className="movers movers-skeleton">
        {[0, 1].map((g) => (
          <div className="movers-group" key={g}>
            <span className="sk sk-title" />
            <div className="movers-row">
              {[0, 1, 2, 3, 4].map((i) => (
                <span className="sk sk-mover" key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="market-table-wrap">
        <div className="market-table">
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
