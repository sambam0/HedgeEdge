import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioAPI, PositionCreate, PositionUpdate } from '../api/portfolio';
import { QUERY_KEYS } from '../api/config';

export function usePortfolios() {
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIOS,
    queryFn: portfolioAPI.getAll,
  });
}

export function usePortfolio(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO(id),
    queryFn: () => portfolioAPI.get(id),
    enabled: !!id,
  });
}

export function usePortfolioPositions(portfolioId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO_POSITIONS(portfolioId),
    queryFn: () => portfolioAPI.getPositions(portfolioId),
    enabled: !!portfolioId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live prices
  });
}

export function usePortfolioPerformance(portfolioId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO_PERFORMANCE(portfolioId),
    queryFn: () => portfolioAPI.getPerformance(portfolioId),
    enabled: !!portfolioId,
    refetchInterval: 30 * 1000,
  });
}

export function useAddPosition(portfolioId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (position: PositionCreate) =>
      portfolioAPI.addPosition(portfolioId, position),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_POSITIONS(portfolioId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_PERFORMANCE(portfolioId) });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ positionId, update }: { positionId: number; update: PositionUpdate }) =>
      portfolioAPI.updatePosition(positionId, update),
    onSuccess: (_, variables) => {
      // Invalidate all portfolio queries (we don't know which portfolio this position belongs to)
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionId: number) =>
      portfolioAPI.deletePosition(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
