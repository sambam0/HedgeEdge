'use client';

import { usePortfolioRiskMetrics } from '@/lib/hooks/useAnalysis';

interface RiskMetricsDashboardProps {
  portfolioId: number;
}

export function RiskMetricsDashboard({ portfolioId }: RiskMetricsDashboardProps) {
  const { data: metrics, isLoading, error } = usePortfolioRiskMetrics(portfolioId);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Metrics
        </h3>
        <div className="text-gray-600 dark:text-gray-400">Loading risk metrics...</div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Metrics
        </h3>
        <div className="text-red-600">Failed to load risk metrics</div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Beta',
      value: metrics.beta.toFixed(2),
      tooltip: 'Volatility relative to market (1.0 = market)'
    },
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpe_ratio.toFixed(2),
      tooltip: 'Risk-adjusted return'
    },
    {
      label: 'Sortino Ratio',
      value: metrics.sortino_ratio.toFixed(2),
      tooltip: 'Downside risk-adjusted return'
    },
    {
      label: 'Max Drawdown',
      value: `${metrics.max_drawdown.toFixed(2)}%`,
      tooltip: 'Largest peak-to-trough decline'
    },
    {
      label: 'VaR (95%)',
      value: `${metrics.var_95.toFixed(2)}%`,
      tooltip: '95% confidence loss limit'
    },
    {
      label: 'Volatility',
      value: `${metrics.volatility.toFixed(2)}%`,
      tooltip: 'Annual volatility'
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Risk Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4"
            title={metric.tooltip}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
