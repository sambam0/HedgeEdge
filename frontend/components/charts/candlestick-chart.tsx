'use client';

import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mockPriceData } from '@/lib/mock-data';

interface CandlestickChartProps {
  data?: any[];
  height?: number;
  showVolume?: boolean;
}

export function CandlestickChart({ data, height = 400, showVolume = true }: CandlestickChartProps) {
  const [volumeVisible, setVolumeVisible] = useState(showVolume);
  const chartData = data || mockPriceData;

  // Memoize candlestick data transformation
  const candleData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      range: [item.low, item.high],
      body: item.close > item.open ? [item.open, item.close] : [item.close, item.open],
      isGain: item.close > item.open,
    }));
  }, [chartData]);

  // Calculate volume scale (normalize to fit below candlesticks)
  const maxVolume = useMemo(() => {
    return Math.max(...candleData.map(d => d.volume || 0));
  }, [candleData]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setVolumeVisible(!volumeVisible)}
          className={`px-3 py-1 text-sm rounded ${
            volumeVisible ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'
          }`}
          title="Toggle Volume Bars"
        >
          Volume
        </button>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={candleData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
          />
          <YAxis
            yAxisId="price"
            stroke="#6b7280"
            fontSize={12}
            domain={['dataMin - 5', 'dataMax + 5']}
            tickFormatter={(value) => `$${value}`}
          />
          {volumeVisible && (
            <YAxis
              yAxisId="volume"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
            formatter={(value: any, name: string) => {
              if (name === 'range') return null;
              if (name === 'body') return null;
              if (name === 'volume') return [`${(value / 1000).toFixed(0)}K`, 'Volume'];
              return [`$${value}`, name];
            }}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            }
          />

          {/* Volume Bars (rendered first so they're behind) */}
          {volumeVisible && (
            <Bar yAxisId="volume" dataKey="volume" barSize={10} opacity={0.3}>
              {candleData.map((entry, index) => (
                <Cell
                  key={`vol-${index}`}
                  fill={entry.isGain ? '#16a34a' : '#dc2626'}
                />
              ))}
            </Bar>
          )}

          {/* High-Low Range (Wicks) */}
          <Bar yAxisId="price" dataKey="range" fill="none" stroke="#6b7280" strokeWidth={2} />

          {/* Open-Close Body (Candle) */}
          <Bar yAxisId="price" dataKey="body" barSize={20}>
            {candleData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isGain ? '#16a34a' : '#dc2626'}
                stroke={entry.isGain ? '#16a34a' : '#dc2626'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
