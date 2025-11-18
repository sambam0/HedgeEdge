'use client';

import { useBenchmarkComparison } from '@/lib/hooks/useAnalysis';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BenchmarkComparisonProps {
  portfolioId: number;
  benchmark?: string;
  period?: string;
}

export function BenchmarkComparison({
  portfolioId,
  benchmark = '^GSPC',
  period = '1Y'
}: BenchmarkComparisonProps) {
  const { data, isLoading, error } = useBenchmarkComparison(portfolioId, benchmark, period);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio vs Benchmark
        </h3>
        <div className="text-gray-600 dark:text-gray-400">Loading comparison...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio vs Benchmark
        </h3>
        <div className="text-red-600">Failed to load benchmark comparison</div>
      </div>
    );
  }

  // Combine data for chart
  const chartData = data.chart_data.portfolio.map((value, index) => ({
    index,
    portfolio: value,
    benchmark: data.chart_data.benchmark[index] || 0,
  }));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio vs {data.benchmark_name}
          </h3>
          <div className="flex gap-4 mt-2">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Portfolio Return</div>
              <div
                className={`text-xl font-bold ${
                  data.portfolio_return >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.portfolio_return >= 0 ? '+' : ''}
                {data.portfolio_return.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {data.benchmark_name} Return
              </div>
              <div
                className={`text-xl font-bold ${
                  data.benchmark_return >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.benchmark_return >= 0 ? '+' : ''}
                {data.benchmark_return.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alpha</div>
              <div
                className={`text-xl font-bold ${
                  data.alpha >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.alpha >= 0 ? '+' : ''}
                {data.alpha.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-neutral-700" />
          <XAxis
            dataKey="index"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(31, 41, 55)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white'
            }}
            formatter={(value: number) => `${value.toFixed(2)}%`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Portfolio"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="#10B981"
            strokeWidth={2}
            name={data.benchmark_name}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
