import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface EconomicIndicator {
  indicator_name: string;
  value: number;
  date: string;
}

export interface YieldCurvePoint {
  maturity: string;
  yield_value: number;
  date: string;
}

export const macroAPI = {
  getAllIndicators: () =>
    apiClient<Record<string, number>>(API_ENDPOINTS.MACRO_INDICATORS),

  getIndicator: (name: string) =>
    apiClient<EconomicIndicator[]>(API_ENDPOINTS.MACRO_INDICATOR(name)),

  getYieldCurve: () =>
    apiClient<YieldCurvePoint[]>(API_ENDPOINTS.MACRO_YIELD_CURVE),
};
