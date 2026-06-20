interface Props {
  error: Error | null;
  isRateLimited: boolean;
  onRetry: () => void;
  onUseMock: () => void;
}

export function ErrorState({ error, isRateLimited, onRetry, onUseMock }: Props) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden>
        {isRateLimited ? "⏳" : "⚠️"}
      </div>
      <h2 className="error-title">
        {isRateLimited ? "CoinGecko rate limit reached" : "Couldn't load market data"}
      </h2>
      <p className="error-message">
        {isRateLimited
          ? "The free CoinGecko API limits how often it can be called. Wait a few seconds and retry, or explore with demo data."
          : (error?.message ?? "An unexpected error occurred while fetching the market.")}
      </p>
      <div className="error-actions">
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
        <button type="button" className="btn" onClick={onUseMock}>
          Use demo data
        </button>
      </div>
    </div>
  );
}
