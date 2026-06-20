import { useEffect, useState } from "react";
import { formatRelativeTime } from "../lib/format";

interface Props {
  updatedAt: number;
  isStale: boolean;
}

export function LastUpdated({ updatedAt, isStale }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!updatedAt) return <span className="last-updated">—</span>;

  return (
    <span
      className={`last-updated${isStale ? " is-stale" : ""}`}
      title="Time since last successful update"
    >
      Updated {formatRelativeTime(updatedAt, now)}
    </span>
  );
}
