import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface Position {
  id: number;
  portfolio_id: number;
  ticker: string;
  shares: number;
  cost_basis: number;
  purchase_date: string;
  current_price?: number;
  current_value?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
}

export interface Portfolio {
  id: number;
  name: string;
  created_at: string;
  positions: Position[];
}

export interface PortfolioPerformance {
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  daily_change: number;
  daily_change_percent: number;
  positions_count: number;
  sp500_return?: number;
  vs_sp500?: number;
}

export interface PositionCreate {
  ticker: string;
  shares: number;
  cost_basis: number;
  purchase_date: string;
}

export interface PositionUpdate {
  shares?: number;
  cost_basis?: number;
}

export const portfolioAPI = {
  getAll: () =>
    apiClient<Portfolio[]>(API_ENDPOINTS.PORTFOLIOS),

  get: (id: number) =>
    apiClient<Portfolio>(API_ENDPOINTS.PORTFOLIO(id)),

  create: (name: string) =>
    apiClient<Portfolio>(API_ENDPOINTS.PORTFOLIOS, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getPositions: (portfolioId: number) =>
    apiClient<Position[]>(API_ENDPOINTS.PORTFOLIO_POSITIONS(portfolioId)),

  addPosition: (portfolioId: number, position: PositionCreate) =>
    apiClient<Position>(API_ENDPOINTS.PORTFOLIO_POSITIONS(portfolioId), {
      method: 'POST',
      body: JSON.stringify(position),
    }),

  updatePosition: (positionId: number, update: PositionUpdate) =>
    apiClient<Position>(API_ENDPOINTS.POSITION(positionId), {
      method: 'PUT',
      body: JSON.stringify(update),
    }),

  deletePosition: (positionId: number) =>
    apiClient<{ success: boolean }>(API_ENDPOINTS.POSITION(positionId), {
      method: 'DELETE',
    }),

  getPerformance: (portfolioId: number) =>
    apiClient<PortfolioPerformance>(API_ENDPOINTS.PORTFOLIO_PERFORMANCE(portfolioId)),
};
