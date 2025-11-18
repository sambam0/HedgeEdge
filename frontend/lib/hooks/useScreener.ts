import { useQuery } from '@tanstack/react-query';
import { screenerAPI, ScreenerFilters } from '../api/screener';
import { QUERY_KEYS } from '../api/config';

export function useScreener(filters: ScreenerFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.SCREENER(filters),
    queryFn: () => screenerAPI.screen(filters),
    enabled: Object.keys(filters).length > 0,
    staleTime: 60 * 1000, // 1 minute
  });
}
