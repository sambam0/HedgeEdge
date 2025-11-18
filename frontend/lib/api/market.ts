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
  volume?: number;
  market_cap?: number;
  pe_ratio?: number;
  open?: number;
  high?: number;
  low?: number;
  previous_close?: number;
  updated_at?: string;
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

export interface IntradayDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IntradayData {
  ticker: string;
  interval: string;
  data: IntradayDataPoint[];
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  exchange?: string;
  country?: string;
  market_cap?: number;
  pe_ratio?: number;
  peg_ratio?: number;
  dividend_yield?: number;
  eps?: number;
  beta?: number;
  '52_week_high'?: number;
  '52_week_low'?: number;
  '50_day_ma'?: number;
  '200_day_ma'?: number;
}

export interface TechnicalIndicators {
  ticker: string;
  indicators: {
    sma_20?: number[];
    sma_50?: number[];
    sma_200?: number[];
    rsi?: number[];
    macd?: number[];
    macd_signal?: number[];
    macd_histogram?: number[];
  };
}

export interface MoverStock {
  ticker: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface MarketMovers {
  gainers: MoverStock[];
  losers: MoverStock[];
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

  getIntradayData: (ticker: string, interval: string = '5min') =>
    apiClient<IntradayData>(
      `${API_ENDPOINTS.MARKET_INTRADAY(ticker)}?interval=${interval}`
    ),

  getCompanyOverview: (ticker: string) =>
    apiClient<CompanyOverview>(API_ENDPOINTS.MARKET_COMPANY(ticker)),

  getTechnicalIndicators: (ticker: string, indicators: string[] = ['SMA', 'RSI']) =>
    apiClient<TechnicalIndicators>(
      `${API_ENDPOINTS.MARKET_TECHNICAL(ticker)}?indicators=${indicators.join(',')}`
    ),

  getMovers: () =>
    apiClient<MarketMovers>(API_ENDPOINTS.MARKET_MOVERS),
};
