'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { PriceChange } from '@/components/ui/price-change';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, PieChart, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function PortfolioPage() {
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['portfolio-performance'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/portfolio/1/performance');
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your positions and performance
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        {portfolioData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Value"
                value={formatCurrency(portfolioData.total_value)}
                icon={Wallet}
              />
              <MetricCard
                label="Total Cost"
                value={formatCurrency(portfolioData.total_cost)}
              />
              <MetricCard
                label="Total Gain/Loss"
                value={formatCurrency(portfolioData.total_gain_loss)}
                change={portfolioData.total_gain_loss_percent}
              />
              <MetricCard
                label="Daily Change"
                value={formatCurrency(portfolioData.daily_change)}
                change={portfolioData.daily_change_percent}
              />
            </div>

            {/* Positions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Positions ({portfolioData.positions_count})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-neutral-800">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Ticker
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Shares
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Avg Cost
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Current Price
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Gain/Loss
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Daily Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                      {portfolioData.positions.map((position: any) => (
                        <tr
                          key={position.id}
                          className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {position.ticker}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right tabular-nums text-gray-900 dark:text-white">
                            {position.shares.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right tabular-nums text-gray-900 dark:text-white">
                            {formatCurrency(position.cost_basis / position.shares)}
                          </td>
                          <td className="py-4 px-4 text-right tabular-nums text-gray-900 dark:text-white">
                            {formatCurrency(position.current_price)}
                          </td>
                          <td className="py-4 px-4 text-right tabular-nums text-gray-900 dark:text-white">
                            {formatCurrency(position.current_value)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`tabular-nums font-semibold ${
                                  position.gain_loss >= 0
                                    ? 'text-market-gain'
                                    : 'text-market-loss'
                                }`}
                              >
                                {formatCurrency(position.gain_loss)}
                              </span>
                              <Badge
                                variant={position.gain_loss >= 0 ? 'gain' : 'loss'}
                                size="sm"
                              >
                                {formatPercent(position.gain_loss_percent, 2, true)}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <PriceChange
                              value={position.daily_change}
                              percent={position.daily_change_percent}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Risk Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Portfolio Concentration
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolioData.positions_count} positions
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Diversification score: Moderate
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Largest Position
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {((portfolioData.positions[0]?.current_value / portfolioData.total_value) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {portfolioData.positions[0]?.ticker}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      vs S&P 500
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPercent(portfolioData.total_gain_loss_percent, 2, true)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Total return
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
