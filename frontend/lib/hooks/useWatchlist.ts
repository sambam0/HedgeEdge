import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistAPI } from '../api/watchlist';
import { QUERY_KEYS } from '../api/config';

export function useWatchlist(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.WATCHLIST(id),
    queryFn: () => watchlistAPI.get(id),
    enabled: !!id,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for live prices
  });
}

export function useAddToWatchlist(watchlistId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticker: string) =>
      watchlistAPI.addStock(watchlistId, ticker),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WATCHLIST(watchlistId) });
    },
  });
}

export function useRemoveFromWatchlist(watchlistId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stockId: number) =>
      watchlistAPI.removeStock(stockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WATCHLIST(watchlistId) });
    },
  });
}
