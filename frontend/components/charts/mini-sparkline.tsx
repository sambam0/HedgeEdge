'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { mockSparklineData } from '@/lib/mock-data';

interface MiniSparklineProps {
  data?: number[];
  positive?: boolean;
  height?: number;
}

export function MiniSparkline({ data, positive = true, height = 48 }: MiniSparklineProps) {
  const sparklineData = (data || mockSparklineData).map((value, index) => ({
    index,
    value,
  }));

  const color = positive ? '#16a34a' : '#dc2626';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={sparklineData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
