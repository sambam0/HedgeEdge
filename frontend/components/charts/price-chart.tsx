'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { mockPriceData } from '@/lib/mock-data';
import { prepareChartData, calculateMovingAverage } from '@/lib/chart-utils';

type ChartType = 'line' | 'area' | 'candlestick';
type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface PriceChartProps {
  ticker?: string;
  data?: any[];
  height?: number;
  showMA?: boolean;
}

export function PriceChart({ ticker, data, height = 400, showMA = false }: PriceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [showMovingAverages, setShowMovingAverages] = useState(showMA);

  // Use mock data if no data provided
  const rawData = data || mockPriceData;

  const timeframes: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'];

  // Memoize processed chart data based on timeframe
  const chartData = useMemo(() => {
    return prepareChartData(rawData, timeframe);
  }, [rawData, timeframe]);

  // Memoize moving averages calculation
  const chartDataWithMA = useMemo(() => {
    if (!showMovingAverages) return chartData;

    const closePrices = chartData.map(d => d.close);
    const ma20 = calculateMovingAverage(closePrices, 20);
    const ma50 = calculateMovingAverage(closePrices, 50);

    return chartData.map((item, index) => ({
      ...item,
      ma20: ma20[index],
      ma50: ma50[index],
    }));
  }, [chartData, showMovingAverages]);

  const displayData = showMovingAverages ? chartDataWithMA : chartData;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'line' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'area' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setShowMovingAverages(!showMovingAverages)}
            className={`px-3 py-1 text-sm rounded ${
              showMovingAverages ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'
            }`}
            title="Toggle Moving Averages (MA20, MA50)"
          >
            MA
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'area' ? (
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            />
            {showMovingAverages && <Legend />}
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPrice)"
              name="Price"
            />
            {showMovingAverages && (
              <>
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA20"
                />
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA50"
                />
              </>
            )}
          </AreaChart>
        ) : (
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            {showMovingAverages && <Legend />}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            {showMovingAverages && (
              <>
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA20"
                />
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA50"
                />
              </>
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
