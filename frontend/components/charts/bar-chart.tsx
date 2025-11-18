'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  color = '#3b82f6',
  valueFormatter = (value) => value.toString(),
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={nameKey} stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={valueFormatter} />
        <Tooltip
          formatter={(value: number) => valueFormatter(value)}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
