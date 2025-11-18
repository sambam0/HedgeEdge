'use client';

import dynamic from 'next/dynamic';

// Lazy load heavy chart components for better performance
// These components won't be loaded until they're actually needed

export const LazyCandlestickChart = dynamic(
  () => import('./candlestick-chart').then((mod) => ({ default: mod.CandlestickChart })),
  {
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    ),
    ssr: false, // Disable server-side rendering for charts
  }
);

export const LazyCorrelationMatrix = dynamic(
  () => import('./correlation-matrix').then((mod) => ({ default: mod.CorrelationMatrix })),
  {
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading matrix...</span>
      </div>
    ),
    ssr: false,
  }
);

export const LazyPriceChart = dynamic(
  () => import('./price-chart').then((mod) => ({ default: mod.PriceChart })),
  {
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    ),
    ssr: false,
  }
);

export const LazyPortfolioPerformanceChart = dynamic(
  () =>
    import('./portfolio-performance-chart').then((mod) => ({ default: mod.PortfolioPerformanceChart })),
  {
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    ),
    ssr: false,
  }
);
