import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchMarket, FORCE_MOCK, RateLimitError } from "./api";
import type { Coin, DataSource } from "../types/market";

const REFETCH_INTERVAL_MS = 60_000;
const STALE_TIME_MS = 30_000;

export interface UseMarketData {
  coins: Coin[];
  source: DataSource | undefined;
  requestedSource: DataSource;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRateLimited: boolean;
  isFetching: boolean;
  isStale: boolean;
  dataUpdatedAt: number;
  refetch: () => void;
  setSource: (s: DataSource) => void;
}

export function useMarketData(): UseMarketData {
  const [requestedSource, setRequestedSource] = useState<DataSource>(
    FORCE_MOCK ? "mock" : "live",
  );

  const query = useQuery({
    queryKey: ["market", requestedSource],
    queryFn: ({ signal }) => fetchMarket(requestedSource, signal),
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
    retry: (count, err) => (err instanceof RateLimitError ? false : count < 2),
  });

  return {
    coins: query.data?.coins ?? [],
    source: query.data?.source,
    requestedSource,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error) ?? null,
    isRateLimited: query.error instanceof RateLimitError,
    isFetching: query.isFetching,
    isStale: query.isStale,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: () => query.refetch(),
    setSource: setRequestedSource,
  };
}
