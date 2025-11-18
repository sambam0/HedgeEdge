import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface CorrelationMatrix {
  assets: string[];
  data: Array<{ asset: string; [key: string]: number | string }>;
  period: string;
}

export interface RiskMetrics {
  beta: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  var_95: number;
  volatility: number;
  risk_free_rate: number;
}

export interface PerformanceAttribution {
  by_position: Array<{
    ticker: string;
    return: number;
    value: number;
    weight: number;
    weighted_return: number;
  }>;
  by_sector: Array<{
    sector: string;
    return: number;
    weight: number;
    count: number;
  }>;
  period: string;
}

export interface BenchmarkComparison {
  portfolio_return: number;
  benchmark_return: number;
  alpha: number;
  benchmark_name: string;
  chart_data: {
    timestamps: number[];
    portfolio: number[];
    benchmark: number[];
  };
  period: string;
}

export interface DiversificationMetrics {
  score: number;
  total_positions: number;
  effective_holdings: number;
  hhi: number;
  concentration_level: 'Low' | 'Medium' | 'High';
  largest_position_weight: number;
  top3_positions_weight: number;
}

export const analysisAPI = {
  getCorrelationMatrix: (tickers: string[], period: string = '6M') =>
    apiClient<CorrelationMatrix>(
      `${API_ENDPOINTS.ANALYSIS_CORRELATION}?tickers=${tickers.join(',')}&period=${period}`
    ),

  getPortfolioRiskMetrics: (portfolioId: number) =>
    apiClient<RiskMetrics>(API_ENDPOINTS.ANALYSIS_PORTFOLIO_RISK(portfolioId)),

  getPerformanceAttribution: (portfolioId: number, period: string = '1Y') =>
    apiClient<PerformanceAttribution>(
      `${API_ENDPOINTS.ANALYSIS_PORTFOLIO_ATTRIBUTION(portfolioId)}?period=${period}`
    ),

  compareToBenchmark: (
    portfolioId: number,
    benchmark: string = '^GSPC',
    period: string = '1Y'
  ) =>
    apiClient<BenchmarkComparison>(
      `${API_ENDPOINTS.ANALYSIS_PORTFOLIO_BENCHMARK(portfolioId)}?benchmark=${benchmark}&period=${period}`
    ),

  getDiversificationMetrics: (portfolioId: number) =>
    apiClient<DiversificationMetrics>(
      API_ENDPOINTS.ANALYSIS_PORTFOLIO_DIVERSIFICATION(portfolioId)
    ),
};
