import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface WatchlistStock {
  id: number;
  watchlist_id: number;
  ticker: string;
  added_at: string;
  current_price?: number;
  change?: number;
  change_percent?: number;
}

export interface Watchlist {
  id: number;
  name: string;
  created_at: string;
  stocks: WatchlistStock[];
}

export const watchlistAPI = {
  get: (id: number) =>
    apiClient<Watchlist>(API_ENDPOINTS.WATCHLIST(id)),

  create: (name: string) =>
    apiClient<Watchlist>(API_ENDPOINTS.WATCHLIST_CREATE, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  addStock: (watchlistId: number, ticker: string) =>
    apiClient<WatchlistStock>(API_ENDPOINTS.WATCHLIST_ADD_STOCK(watchlistId), {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    }),

  removeStock: (stockId: number) =>
    apiClient<{ success: boolean }>(API_ENDPOINTS.WATCHLIST_REMOVE_STOCK(stockId), {
      method: 'DELETE',
    }),
};
