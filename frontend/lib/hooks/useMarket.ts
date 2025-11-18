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

export function useIntradayData(ticker: string, interval: string = '5min') {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_INTRADAY(ticker, interval),
    queryFn: () => marketAPI.getIntradayData(ticker, interval),
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    enabled: !!ticker,
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function useCompanyOverview(ticker: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_COMPANY(ticker),
    queryFn: () => marketAPI.getCompanyOverview(ticker),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (company info doesn't change often)
    enabled: !!ticker,
  });
}

export function useTechnicalIndicators(ticker: string, indicators: string[] = ['SMA', 'RSI']) {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_TECHNICAL(ticker, indicators),
    queryFn: () => marketAPI.getTechnicalIndicators(ticker, indicators),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!ticker && indicators.length > 0,
  });
}

export function useMarketMovers() {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_MOVERS,
    queryFn: marketAPI.getMovers,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });
}
