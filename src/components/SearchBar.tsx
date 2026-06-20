interface Props {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  total: number;
}

export function SearchBar({ value, onChange, resultCount, total }: Props) {
  return (
    <div className="searchbar">
      <span className="search-icon" aria-hidden>
        ⌕
      </span>
      <input
        type="search"
        className="search-input"
        placeholder="Search by name or symbol…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search coins by name or symbol"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      <span className="search-count">
        {resultCount === total ? `${total} coins` : `${resultCount} / ${total}`}
      </span>
    </div>
  );
}
