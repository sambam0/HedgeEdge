'use client';

import { useDiversificationMetrics } from '@/lib/hooks/useAnalysis';

interface DiversificationScoreProps {
  portfolioId: number;
}

export function DiversificationScore({ portfolioId }: DiversificationScoreProps) {
  const { data, isLoading, error } = useDiversificationMetrics(portfolioId);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Diversification Score
        </h3>
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Diversification Score
        </h3>
        <div className="text-red-600">Failed to load diversification metrics</div>
      </div>
    );
  }

  const scoreColor =
    data.score >= 70
      ? 'text-green-600'
      : data.score >= 40
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Diversification Score
      </h3>

      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${scoreColor}`}>
          {data.score}/100
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Position Count</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.total_positions}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Effective Holdings</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.effective_holdings.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Largest Position</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.largest_position_weight.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Top 3 Positions</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.top3_positions_weight.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Concentration</span>
          <span
            className={`font-semibold ${
              data.concentration_level === 'Low'
                ? 'text-green-600'
                : data.concentration_level === 'Medium'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {data.concentration_level}
          </span>
        </div>
      </div>
    </div>
  );
}
