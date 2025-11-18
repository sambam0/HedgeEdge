import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface Quote {
  ticker: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  updated_at: string;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  ticker: string;
  interval: string;
  data: ChartDataPoint[];
}

export interface SearchResult {
  ticker: string;
  name: string;
  type: string;
  region: string;
}

export const marketAPI = {
  getIndices: () =>
    apiClient<MarketIndex[]>(API_ENDPOINTS.MARKET_INDICES),

  getQuote: (ticker: string) =>
    apiClient<Quote>(API_ENDPOINTS.MARKET_QUOTE(ticker)),

  getChartData: (ticker: string, interval: string = 'daily') =>
    apiClient<ChartData>(
      `${API_ENDPOINTS.MARKET_CHART(ticker)}?interval=${interval}`
    ),

  search: (query: string) =>
    apiClient<{ query: string; results: SearchResult[] }>(
      `${API_ENDPOINTS.MARKET_SEARCH}?q=${encodeURIComponent(query)}`
    ),
};
