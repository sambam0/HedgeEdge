'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockYieldCurve } from '@/lib/mock-data';

interface YieldCurveChartProps {
  data?: any[];
  height?: number;
}

export function YieldCurveChart({ data, height = 300 }: YieldCurveChartProps) {
  const chartData = data || mockYieldCurve;

  // Memoize inversion calculation
  const isInverted = useMemo(() => {
    const twoYear = chartData.find(d => d.maturity === '2Y')?.yield || 0;
    const tenYear = chartData.find(d => d.maturity === '10Y')?.yield || 0;
    return twoYear > tenYear;
  }, [chartData]);

  return (
    <div className="space-y-2">
      {isInverted && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Yield curve is inverted - potential recession indicator
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="maturity" stroke="#6b7280" fontSize={12} />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'dataMax + 0.5']}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke={isInverted ? '#f59e0b' : '#3b82f6'}
            strokeWidth={3}
            dot={{ fill: isInverted ? '#f59e0b' : '#3b82f6', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
