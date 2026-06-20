import { useEffect, useRef, useState } from "react";

const MIN_REFRESHING_MS = 600;
const CONFIRM_MS = 900;

export type RefreshStatus = "idle" | "refreshing" | "updated";

export function useRefreshStatus(
  isFetching: boolean,
  dataUpdatedAt: number,
): RefreshStatus {
  const [status, setStatus] = useState<RefreshStatus>("idle");
  const startedAt = useRef(0);
  const updatedAtAtStart = useRef(dataUpdatedAt);
  const wasFetching = useRef(isFetching);

  useEffect(() => {
    const started = !wasFetching.current && isFetching;
    const finished = wasFetching.current && !isFetching;
    wasFetching.current = isFetching;

    if (started) {
      startedAt.current = Date.now();
      updatedAtAtStart.current = dataUpdatedAt;
      setStatus("refreshing");
      return;
    }

    if (finished) {
      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, MIN_REFRESHING_MS - elapsed);
      const didUpdate = dataUpdatedAt !== updatedAtAtStart.current;
      const id = setTimeout(() => setStatus(didUpdate ? "updated" : "idle"), remaining);
      return () => clearTimeout(id);
    }
  }, [isFetching, dataUpdatedAt]);

  useEffect(() => {
    if (status !== "updated") return;
    const id = setTimeout(() => setStatus("idle"), CONFIRM_MS);
    return () => clearTimeout(id);
  }, [status]);

  return status;
}
