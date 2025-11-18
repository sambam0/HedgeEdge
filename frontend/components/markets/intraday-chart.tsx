'use client';

import { useState } from 'react';
import { useIntradayData } from '@/lib/hooks/useMarket';
import { CandlestickChart } from '@/components/charts/candlestick-chart';

interface IntradayChartProps {
  ticker: string;
}

export function IntradayChart({ ticker }: IntradayChartProps) {
  const [interval, setInterval] = useState('5min');
  const [showVolume, setShowVolume] = useState(true);

  const { data, isLoading, error } = useIntradayData(ticker, interval);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">
            Unable to load chart data. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Transform the data to match CandlestickChart expected format
  const chartData = data.data.map((point) => ({
    date: point.timestamp,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume,
  }));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {ticker} - Intraday Chart
        </h3>

        <div className="flex gap-2">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1min">1 min</option>
            <option value="5min">5 min</option>
            <option value="15min">15 min</option>
            <option value="30min">30 min</option>
            <option value="60min">1 hour</option>
          </select>
        </div>
      </div>

      <CandlestickChart data={chartData} showVolume={showVolume} height={400} />
    </div>
  );
}
