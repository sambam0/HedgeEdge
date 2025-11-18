# Workstream 2: Frontend Data Layer & API Integration

**Agent Focus:** Data fetching, caching, state management, and real-time updates

**Estimated Time:** 4-5 days

**Priority:** HIGH (Depends on backend, required for UI)

---

## Overview

Build the complete frontend data layer including:
- React Query configuration and setup
- API client utilities for all endpoints
- Custom hooks for data fetching
- Real-time update mechanisms
- Error handling and retry logic
- Loading states and caching strategies

---

## Task Breakdown

### 1. React Query Setup (Day 1 - Morning)

#### 1.1 Configure Query Client
**File:** `frontend/app/providers.tsx` (update existing)

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

#### 1.2 Create API configuration
**File:** `frontend/lib/api/config.ts`

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Market
  MARKET_INDICES: '/api/v1/market/indices',
  MARKET_QUOTE: (ticker: string) => `/api/v1/market/quote/${ticker}`,
  MARKET_CHART: (ticker: string) => `/api/v1/market/chart/${ticker}`,
  MARKET_SEARCH: '/api/v1/market/search',

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
} as const;

export const QUERY_KEYS = {
  // Market
  MARKET_INDICES: ['market', 'indices'],
  MARKET_QUOTE: (ticker: string) => ['market', 'quote', ticker],
  MARKET_CHART: (ticker: string, interval: string) => ['market', 'chart', ticker, interval],

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
} as const;
```

#### 1.3 Create base API client
**File:** `frontend/lib/api/client.ts`

```typescript
import { API_BASE_URL } from './config';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || 'An error occurred',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or parsing error
    throw new APIError(
      'Network error occurred',
      0,
      { originalError: error }
    );
  }
}
```

---

### 2. Market Data API Layer (Day 1 - Afternoon)

#### 2.1 Create market API functions
**File:** `frontend/lib/api/market.ts`

```typescript
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
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  updated_at: string;
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
};
```

#### 2.2 Create market hooks
**File:** `frontend/lib/hooks/useMarket.ts`

```typescript
import { useQuery, useQueries } from '@tanstack/react-query';
import { marketAPI } from '../api/market';
import { QUERY_KEYS } from '../api/config';

export function useMarketIndices() {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_INDICES,
    queryFn: marketAPI.getIndices,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useQuote(ticker: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_QUOTE(ticker),
    queryFn: () => marketAPI.getQuote(ticker),
    enabled: enabled && !!ticker,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  });
}

export function useMultipleQuotes(tickers: string[]) {
  return useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: QUERY_KEYS.MARKET_QUOTE(ticker),
      queryFn: () => marketAPI.getQuote(ticker),
      refetchInterval: 15 * 1000,
    })),
  });
}

export function useChartData(ticker: string, interval: string = 'daily') {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET_CHART(ticker, interval),
    queryFn: () => marketAPI.getChartData(ticker, interval),
    enabled: !!ticker,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['market', 'search', query],
    queryFn: () => marketAPI.search(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

### 3. Portfolio Data API Layer (Day 2)

#### 3.1 Create portfolio API functions
**File:** `frontend/lib/api/portfolio.ts`

```typescript
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
```

#### 3.2 Create portfolio hooks
**File:** `frontend/lib/hooks/usePortfolio.ts`

```typescript
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
```

---

### 4. Watchlist & Screener API Layer (Day 3)

#### 4.1 Create watchlist API functions
**File:** `frontend/lib/api/watchlist.ts`

```typescript
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
```

#### 4.2 Create watchlist hooks
**File:** `frontend/lib/hooks/useWatchlist.ts`

```typescript
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
```

#### 4.3 Create screener API functions
**File:** `frontend/lib/api/screener.ts`

```typescript
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
```

#### 4.4 Create screener hooks
**File:** `frontend/lib/hooks/useScreener.ts`

```typescript
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
```

---

### 5. Macro Data API Layer (Day 4)

#### 5.1 Create macro API functions
**File:** `frontend/lib/api/macro.ts`

```typescript
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
```

#### 5.2 Create macro hooks
**File:** `frontend/lib/hooks/useMacro.ts`

```typescript
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
```

---

### 6. Real-time Updates & Animations (Day 5)

#### 6.1 Create price flash animation hook
**File:** `frontend/lib/hooks/usePriceFlash.ts`

```typescript
import { useState, useEffect, useRef } from 'react';

type FlashType = 'gain' | 'loss' | 'none';

export function usePriceFlash(value: number | undefined) {
  const [flashType, setFlashType] = useState<FlashType>('none');
  const previousValue = useRef<number | undefined>(value);

  useEffect(() => {
    if (value === undefined || previousValue.current === undefined) {
      previousValue.current = value;
      return;
    }

    if (value > previousValue.current) {
      setFlashType('gain');
    } else if (value < previousValue.current) {
      setFlashType('loss');
    }

    previousValue.current = value;

    // Clear flash after 500ms
    const timeout = setTimeout(() => setFlashType('none'), 500);
    return () => clearTimeout(timeout);
  }, [value]);

  return flashType;
}

export function getFlashClassName(flashType: FlashType): string {
  switch (flashType) {
    case 'gain':
      return 'animate-flash-gain';
    case 'loss':
      return 'animate-flash-loss';
    default:
      return '';
  }
}
```

#### 6.2 Add flash animations to globals.css
**File:** `frontend/app/globals.css` (add to existing)

```css
@keyframes flash-gain {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(34, 197, 94, 0.2);
  }
}

@keyframes flash-loss {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(239, 68, 68, 0.2);
  }
}

.animate-flash-gain {
  animation: flash-gain 0.5s ease-out;
}

.animate-flash-loss {
  animation: flash-loss 0.5s ease-out;
}
```

#### 6.3 Create LivePrice component
**File:** `frontend/components/ui/live-price.tsx`

```tsx
'use client';

import { useQuote } from '@/lib/hooks/useMarket';
import { usePriceFlash, getFlashClassName } from '@/lib/hooks/usePriceFlash';
import { formatCurrency } from '@/lib/utils';
import { PriceChange } from './price-change';

interface LivePriceProps {
  ticker: string;
  showChange?: boolean;
  className?: string;
}

export function LivePrice({ ticker, showChange = true, className }: LivePriceProps) {
  const { data: quote, isLoading } = useQuote(ticker);
  const flashType = usePriceFlash(quote?.price);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    );
  }

  if (!quote) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`font-mono font-semibold tabular-nums ${getFlashClassName(flashType)}`}>
        {formatCurrency(quote.price)}
      </span>
      {showChange && (
        <PriceChange value={quote.change} percent={quote.change_percent} size="sm" />
      )}
    </div>
  );
}
```

---

### 7. Error Handling & Loading States (Day 5)

#### 7.1 Create error boundary component
**File:** `frontend/components/error-boundary.tsx`

```tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Try again
              </button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

#### 7.2 Create query error handler
**File:** `frontend/lib/hooks/useQueryError.ts`

```typescript
import { useEffect } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { APIError } from '../api/client';

export function useQueryError(query: UseQueryResult, onError?: (error: APIError) => void) {
  useEffect(() => {
    if (query.error) {
      const error = query.error as APIError;

      // Log error
      console.error('Query error:', {
        message: error.message,
        status: error.status,
        data: error.data,
      });

      // Call custom handler
      if (onError) {
        onError(error);
      }

      // Could also show toast notification here
    }
  }, [query.error, onError]);
}
```

#### 7.3 Create skeleton loader components
**File:** `frontend/components/ui/skeleton.tsx`

```tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

### 8. Utility Functions (Day 5)

#### 8.1 Create formatting utilities
**File:** `frontend/lib/utils.ts` (add to existing)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2, showSign = true): string {
  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

export function formatNumber(value: number, compact = false): string {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat('en-US').format(value);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return formatCurrency(value);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
```

---

## Testing Checklist

- [ ] React Query DevTools visible in development
- [ ] API client handles errors correctly
- [ ] Market indices update every 30 seconds
- [ ] Quote prices update every 15 seconds
- [ ] Portfolio data updates on mutation
- [ ] Watchlist updates on add/remove
- [ ] Screener results update when filters change
- [ ] Price flash animations work correctly
- [ ] Loading skeletons display while fetching
- [ ] Error boundaries catch and display errors
- [ ] Number formatting functions work correctly
- [ ] Cache invalidation works after mutations

---

## Environment Variables

**File:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Completion Criteria

✅ All API client functions implemented
✅ All custom hooks created and tested
✅ Real-time updates working (15-30 second intervals)
✅ Price flash animations functional
✅ Error handling comprehensive
✅ Loading states smooth and informative
✅ Utility functions tested
✅ Ready for UI integration
