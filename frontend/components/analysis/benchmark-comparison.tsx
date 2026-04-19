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
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface BenchmarkComparisonProps {
  portfolioId: number;
  benchmark?: string;
  period?: string;
}

export function BenchmarkComparison({
  portfolioId,
  benchmark = '^GSPC',
  period = '1Y',
}: BenchmarkComparisonProps) {
  const { data, isLoading, error } = useBenchmarkComparison(portfolioId, benchmark, period);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <Skeleton className="h-6 w-56 mb-6" />
        <div className="flex gap-8 mb-6">
          <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-7 w-20" /></div>
          <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-7 w-20" /></div>
          <div><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="h-7 w-16" /></div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio vs Benchmark
        </h3>
        <div className="text-red-600 dark:text-red-400">Failed to load benchmark comparison</div>
      </div>
    );
  }

  const chartData = data.chart_data.portfolio.map((value, index) => ({
    index,
    portfolio: value,
    benchmark: data.chart_data.benchmark[index] ?? 0,
  }));

  const returnClass = (v: number) => (v >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400');
  const sign = (v: number) => (v >= 0 ? '+' : '');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio vs {data.benchmark_name}
          </h3>
          <div className="flex gap-6 mt-2">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Portfolio Return</div>
              <div className={`text-xl font-bold ${returnClass(data.portfolio_return)}`}>
                {sign(data.portfolio_return)}{data.portfolio_return.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{data.benchmark_name} Return</div>
              <div className={`text-xl font-bold ${returnClass(data.benchmark_return)}`}>
                {sign(data.benchmark_return)}{data.benchmark_return.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alpha</div>
              <div className={`text-xl font-bold ${returnClass(data.alpha)}`}>
                {sign(data.alpha)}{data.alpha.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.2)" />
          <XAxis dataKey="index" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Tooltip
            cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{
              backgroundColor: 'rgb(17, 24, 39)',
              border: '1px solid rgba(75,85,99,0.4)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`]}
          />
          <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Portfolio"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="#10b981"
            strokeWidth={2}
            name={data.benchmark_name}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Brush
            dataKey="index"
            height={24}
            stroke="#3b82f6"
            travellerWidth={6}
            fill="transparent"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
