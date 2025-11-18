'use client';

import { useState } from 'react';
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
}

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const chartData = data || mockPriceData;

  // Transform data for candlestick representation
  const candleData = chartData.map((item) => ({
    ...item,
    range: [item.low, item.high],
    body: item.close > item.open ? [item.open, item.close] : [item.close, item.open],
    isGain: item.close > item.open,
  }));

  return (
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
          formatter={(value: any, name: string) => {
            if (name === 'range') return null;
            if (name === 'body') return null;
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

        {/* High-Low Range (Wicks) */}
        <Bar dataKey="range" fill="none" stroke="#6b7280" strokeWidth={2} />

        {/* Open-Close Body (Candle) */}
        <Bar dataKey="body" barSize={20}>
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
  );
}
