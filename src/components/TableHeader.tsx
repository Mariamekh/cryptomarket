import type { SortKey, SortState } from "../lib/market";
import { COLUMNS } from "./columns";

interface Props {
  sort: SortState;
  onSort: (key: SortKey) => void;
}

export function TableHeader({ sort, onSort }: Props) {
  return (
    <div className="market-grid market-header" role="row">
      {COLUMNS.map((col, i) => {
        const active = col.key !== null && col.key === sort.key;
        const sortable = col.key !== null;
        return (
          <button
            key={i}
            type="button"
            className={`th cell-${col.align}${sortable ? " th-sortable" : ""}${
              active ? " th-active" : ""
            }`}
            disabled={!sortable}
            onClick={() => sortable && onSort(col.key as SortKey)}
            aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
          >
            {col.label}
            {active && <span className="th-arrow">{sort.dir === "asc" ? "▲" : "▼"}</span>}
          </button>
        );
      })}
    </div>
  );
}
