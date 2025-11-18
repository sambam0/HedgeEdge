'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockSectorAllocation } from '@/lib/mock-data';

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Healthcare: '#10b981',
  Financial: '#f59e0b',
  Consumer: '#ec4899',
  Industrial: '#6b7280',
  Energy: '#f97316',
  Materials: '#8b5cf6',
  'Real Estate': '#06b6d4',
  Utilities: '#84cc16',
  Communication: '#a855f7',
};

interface DonutChartProps {
  data?: any[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 300,
}: DonutChartProps) {
  const chartData = data || mockSectorAllocation;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={SECTOR_COLORS[entry.sector] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {centerLabel && centerValue && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-sm text-gray-500 dark:text-gray-400">{centerLabel}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{centerValue}</div>
        </div>
      )}
    </div>
  );
}
