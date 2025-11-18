'use client';

import { useMemo } from 'react';
import { mockCorrelationMatrix } from '@/lib/mock-data';

interface CorrelationMatrixProps {
  data?: {
    assets: string[];
    data: Array<{ asset: string; [key: string]: number | string }>;
  };
}

export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const matrixData = data || mockCorrelationMatrix;

  // Memoize color calculation
  const getColor = useMemo(() => {
    return (value: number) => {
      if (value === 1) return 'bg-blue-900 text-white';
      if (value >= 0.8) return 'bg-blue-700 text-white';
      if (value >= 0.6) return 'bg-blue-500 text-white';
      if (value >= 0.4) return 'bg-blue-300 text-gray-900';
      if (value >= 0.2) return 'bg-blue-100 text-gray-900';
      if (value >= 0) return 'bg-gray-50 text-gray-900';
      if (value >= -0.2) return 'bg-red-100 text-gray-900';
      if (value >= -0.4) return 'bg-red-300 text-gray-900';
      if (value >= -0.6) return 'bg-red-500 text-white';
      if (value >= -0.8) return 'bg-red-700 text-white';
      return 'bg-red-900 text-white';
    };
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                Asset
              </th>
              {matrixData.assets.map((asset) => (
                <th
                  key={asset}
                  className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  {asset}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.data.map((row) => (
              <tr key={row.asset as string}>
                <td className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {row.asset}
                </td>
                {matrixData.assets.map((asset) => {
                  const value = (row as Record<string, string | number>)[asset] as number;
                  return (
                    <td
                      key={asset}
                      className={`p-2 text-xs font-mono text-center border border-gray-200 dark:border-gray-700 transition-transform hover:scale-110 cursor-pointer ${getColor(
                        value
                      )}`}
                      title={`${row.asset} vs ${asset}: ${value.toFixed(2)}`}
                    >
                      {value.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        <span className="text-gray-600 dark:text-gray-400">Correlation:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-700 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">-1.0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">0.0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-700 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">+1.0</span>
        </div>
      </div>
    </div>
  );
}
