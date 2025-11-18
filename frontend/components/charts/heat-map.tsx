'use client';

import { mockHeatMapData } from '@/lib/mock-data';

interface HeatMapProps {
  data?: Array<{ sector: string; performance: number }>;
}

export function HeatMap({ data }: HeatMapProps) {
  const heatMapData = data || mockHeatMapData;

  const getColor = (performance: number) => {
    if (performance > 2) return 'bg-green-600';
    if (performance > 1) return 'bg-green-500';
    if (performance > 0.5) return 'bg-green-400';
    if (performance > 0) return 'bg-green-300';
    if (performance > -0.5) return 'bg-red-300';
    if (performance > -1) return 'bg-red-400';
    if (performance > -2) return 'bg-red-500';
    return 'bg-red-600';
  };

  const getTextColor = (performance: number) => {
    return Math.abs(performance) > 0.5 ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {heatMapData.map((item) => (
        <div
          key={item.sector}
          className={`${getColor(item.performance)} ${getTextColor(
            item.performance
          )} p-4 rounded-lg text-center transition-transform hover:scale-105 cursor-pointer`}
        >
          <div className="font-semibold text-sm mb-1">{item.sector}</div>
          <div className="text-lg font-bold">
            {item.performance > 0 ? '+' : ''}
            {item.performance.toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}
