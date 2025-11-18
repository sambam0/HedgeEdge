export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Market
  MARKET_INDICES: '/api/v1/market/indices',
  MARKET_QUOTE: (ticker: string) => `/api/v1/market/quote/${ticker}`,
  MARKET_CHART: (ticker: string) => `/api/v1/market/chart/${ticker}`,
  MARKET_SEARCH: '/api/v1/market/search',
  MARKET_INTRADAY: (ticker: string) => `/api/v1/market/intraday/${ticker}`,
  MARKET_COMPANY: (ticker: string) => `/api/v1/market/company/${ticker}`,
  MARKET_TECHNICAL: (ticker: string) => `/api/v1/market/technical/${ticker}`,
  MARKET_MOVERS: '/api/v1/market/movers',

  // Portfolio
  PORTFOLIOS: '/api/v1/portfolio',
  PORTFOLIO: (id: number) => `/api/v1/portfolio/${id}`,
  PORTFOLIO_POSITIONS: (id: number) => `/api/v1/portfolio/${id}/positions`,
  PORTFOLIO_PERFORMANCE: (id: number) => `/api/v1/portfolio/${id}/performance`,
  POSITION: (id: number) => `/api/v1/portfolio/positions/${id}`,

  // Watchlist
  WATCHLIST: (id: number) => `/api/v1/watchlist/${id}`,
  WATCHLIST_CREATE: '/api/v1/watchlist',
  WATCHLIST_ADD_STOCK: (id: number) => `/api/v1/watchlist/${id}/stocks`,
  WATCHLIST_REMOVE_STOCK: (stockId: number) => `/api/v1/watchlist/stocks/${stockId}`,

  // Screener
  SCREENER: '/api/v1/screener',

  // Macro
  MACRO_INDICATORS: '/api/v1/macro/indicators',
  MACRO_INDICATOR: (name: string) => `/api/v1/macro/indicator/${name}`,
  MACRO_YIELD_CURVE: '/api/v1/macro/yield-curve',

  // Analysis
  ANALYSIS_CORRELATION: '/api/v1/analysis/correlation',
  ANALYSIS_PORTFOLIO_RISK: (portfolioId: number) => `/api/v1/analysis/portfolio/${portfolioId}/risk`,
  ANALYSIS_PORTFOLIO_ATTRIBUTION: (portfolioId: number) => `/api/v1/analysis/portfolio/${portfolioId}/attribution`,
  ANALYSIS_PORTFOLIO_BENCHMARK: (portfolioId: number) => `/api/v1/analysis/portfolio/${portfolioId}/benchmark`,
  ANALYSIS_PORTFOLIO_DIVERSIFICATION: (portfolioId: number) => `/api/v1/analysis/portfolio/${portfolioId}/diversification`,
} as const;

export const QUERY_KEYS = {
  // Market
  MARKET_INDICES: ['market', 'indices'],
  MARKET_QUOTE: (ticker: string) => ['market', 'quote', ticker],
  MARKET_CHART: (ticker: string, interval: string) => ['market', 'chart', ticker, interval],
  MARKET_INTRADAY: (ticker: string, interval: string) => ['market', 'intraday', ticker, interval],
  MARKET_COMPANY: (ticker: string) => ['market', 'company', ticker],
  MARKET_TECHNICAL: (ticker: string, indicators: string[]) => ['market', 'technical', ticker, ...indicators],
  MARKET_MOVERS: ['market', 'movers'],

  // Portfolio
  PORTFOLIOS: ['portfolios'],
  PORTFOLIO: (id: number) => ['portfolio', id],
  PORTFOLIO_POSITIONS: (id: number) => ['portfolio', id, 'positions'],
  PORTFOLIO_PERFORMANCE: (id: number) => ['portfolio', id, 'performance'],

  // Watchlist
  WATCHLIST: (id: number) => ['watchlist', id],

  // Screener
  SCREENER: (filters: any) => ['screener', filters],

  // Macro
  MACRO_INDICATORS: ['macro', 'indicators'],
  MACRO_INDICATOR: (name: string) => ['macro', 'indicator', name],
  MACRO_YIELD_CURVE: ['macro', 'yield-curve'],

  // Analysis
  ANALYSIS_CORRELATION: (tickers: string[], period: string) => ['analysis', 'correlation', tickers, period],
  ANALYSIS_PORTFOLIO_RISK: (portfolioId: number) => ['analysis', 'portfolio', portfolioId, 'risk'],
  ANALYSIS_PORTFOLIO_ATTRIBUTION: (portfolioId: number, period: string) => ['analysis', 'portfolio', portfolioId, 'attribution', period],
  ANALYSIS_PORTFOLIO_BENCHMARK: (portfolioId: number, benchmark: string, period: string) => ['analysis', 'portfolio', portfolioId, 'benchmark', benchmark, period],
  ANALYSIS_PORTFOLIO_DIVERSIFICATION: (portfolioId: number) => ['analysis', 'portfolio', portfolioId, 'diversification'],
} as const;
