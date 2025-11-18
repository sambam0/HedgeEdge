import { useQuery } from '@tanstack/react-query';
import { macroAPI } from '../api/macro';
import { QUERY_KEYS } from '../api/config';

export function useMacroIndicators() {
  return useQuery({
    queryKey: QUERY_KEYS.MACRO_INDICATORS,
    queryFn: macroAPI.getAllIndicators,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useMacroIndicator(name: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MACRO_INDICATOR(name),
    queryFn: () => macroAPI.getIndicator(name),
    enabled: !!name,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useYieldCurve() {
  return useQuery({
    queryKey: QUERY_KEYS.MACRO_YIELD_CURVE,
    queryFn: macroAPI.getYieldCurve,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
