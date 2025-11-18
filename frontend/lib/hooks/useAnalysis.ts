import { useQuery } from '@tanstack/react-query';
import { analysisAPI } from '../api/analysis';
import { QUERY_KEYS } from '../api/config';

export function useCorrelationMatrix(tickers: string[], period: string = '6M') {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYSIS_CORRELATION(tickers, period),
    queryFn: () => analysisAPI.getCorrelationMatrix(tickers, period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: tickers.length > 1,
  });
}

export function usePortfolioRiskMetrics(portfolioId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYSIS_PORTFOLIO_RISK(portfolioId),
    queryFn: () => analysisAPI.getPortfolioRiskMetrics(portfolioId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!portfolioId,
  });
}

export function usePerformanceAttribution(portfolioId: number, period: string = '1Y') {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYSIS_PORTFOLIO_ATTRIBUTION(portfolioId, period),
    queryFn: () => analysisAPI.getPerformanceAttribution(portfolioId, period),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!portfolioId,
  });
}

export function useBenchmarkComparison(
  portfolioId: number,
  benchmark: string = '^GSPC',
  period: string = '1Y'
) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYSIS_PORTFOLIO_BENCHMARK(portfolioId, benchmark, period),
    queryFn: () => analysisAPI.compareToBenchmark(portfolioId, benchmark, period),
    staleTime: 30 * 60 * 1000,
    enabled: !!portfolioId,
  });
}

export function useDiversificationMetrics(portfolioId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYSIS_PORTFOLIO_DIVERSIFICATION(portfolioId),
    queryFn: () => analysisAPI.getDiversificationMetrics(portfolioId),
    staleTime: 10 * 60 * 1000,
    enabled: !!portfolioId,
  });
}
