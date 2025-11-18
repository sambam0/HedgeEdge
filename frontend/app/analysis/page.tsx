'use client';

import { useState } from 'react';
import { usePortfolios } from '@/lib/hooks/usePortfolio';
import { useCorrelationMatrix } from '@/lib/hooks/useAnalysis';
import { RiskMetricsDashboard } from '@/components/analysis/risk-metrics-dashboard';
import { BenchmarkComparison } from '@/components/analysis/benchmark-comparison';
import { DiversificationScore } from '@/components/analysis/diversification-score';
import { CorrelationMatrix } from '@/components/charts/correlation-matrix';

export default function AnalysisPage() {
  const { data: portfolios, isLoading: portfoliosLoading } = usePortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState(1);
  const [correlationPeriod, setCorrelationPeriod] = useState('6M');
  const [benchmarkPeriod, setBenchmarkPeriod] = useState('1Y');

  // Get tickers from portfolio (simplified - using common tickers for demo)
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  const { data: correlation, isLoading: correlationLoading } = useCorrelationMatrix(
    tickers,
    correlationPeriod
  );

  if (portfoliosLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced portfolio analytics and risk metrics
            </p>
          </div>

          {/* Portfolio Selector */}
          {portfolios && portfolios.length > 0 && (
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
            >
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Risk Metrics & Diversification */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RiskMetricsDashboard portfolioId={selectedPortfolio} />
          </div>
          <div>
            <DiversificationScore portfolioId={selectedPortfolio} />
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Benchmark Comparison
            </h3>
            <select
              value={benchmarkPeriod}
              onChange={(e) => setBenchmarkPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>
          <BenchmarkComparison
            portfolioId={selectedPortfolio}
            period={benchmarkPeriod}
          />
        </div>

        {/* Correlation Matrix */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Asset Correlation Matrix
            </h3>
            <select
              value={correlationPeriod}
              onChange={(e) => setCorrelationPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>

          {correlationLoading ? (
            <div className="text-gray-600 dark:text-gray-400">
              Loading correlation matrix...
            </div>
          ) : correlation ? (
            <CorrelationMatrix data={correlation} />
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              No correlation data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
