import { memo } from "react";
import { formatPercent } from "../lib/format";

interface Props {
  value: number | null | undefined;
  showArrow?: boolean;
}

function PercentChangeBase({ value, showArrow = false }: Props) {
  if (value == null || Number.isNaN(value)) {
    return <span className="pct pct-muted">—</span>;
  }
  const dir = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "";
  return (
    <span className={`pct pct-${dir}`}>
      {showArrow && arrow && <span className="pct-arrow">{arrow}</span>}
      {formatPercent(value)}
    </span>
  );
}

export const PercentChange = memo(PercentChangeBase);
