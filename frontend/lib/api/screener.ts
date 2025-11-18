import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface ScreenerFilters {
  min_market_cap?: number;
  max_market_cap?: number;
  min_pe?: number;
  max_pe?: number;
  min_price?: number;
  max_price?: number;
  sector?: string;
}

export interface ScreenerResult {
  ticker: string;
  name: string;
  price: number;
  market_cap: number;
  pe_ratio?: number;
  change_percent: number;
  volume: number;
}

export const screenerAPI = {
  screen: (filters: ScreenerFilters) =>
    apiClient<ScreenerResult[]>(API_ENDPOINTS.SCREENER, {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
};
