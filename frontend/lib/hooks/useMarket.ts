import { useQuery, useQueries } from '@tanstack/react-query';
import { marketAPI } from '../api/market';
import { QUERY_KEYS } from '../api/config';

export function useMarketIndices() {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_INDICES,
    queryFn: marketAPI.getIndices,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useQuote(ticker: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_QUOTE(ticker),
    queryFn: () => marketAPI.getQuote(ticker),
    enabled: enabled && !!ticker,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  });
}

export function useMultipleQuotes(tickers: string[]) {
  return useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: QUERY_KEYS.MARKET_QUOTE(ticker),
      queryFn: () => marketAPI.getQuote(ticker),
      refetchInterval: 15 * 1000,
    })),
  });
}

export function useChartData(ticker: string, interval: string = 'daily') {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_CHART(ticker, interval),
    queryFn: () => marketAPI.getChartData(ticker, interval),
    enabled: !!ticker,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['market', 'search', query],
    queryFn: () => marketAPI.search(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
