'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockPortfolioPerformance } from '@/lib/mock-data';

interface PortfolioPerformanceChartProps {
  data?: any[];
  height?: number;
}

export function PortfolioPerformanceChart({
  data,
  height = 300,
}: PortfolioPerformanceChartProps) {
  const chartData = data || mockPortfolioPerformance;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Your Portfolio"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="sp500"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="S&P 500"
          dot={false}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
