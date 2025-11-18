'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { PriceChange } from '@/components/ui/price-change';
import { DataTable, Column } from '@/components/ui/data-table';
import { MiniSparkline } from '@/components/charts/mini-sparkline';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  mockPortfolioPositions,
  mockWatchlistStocks,
  mockMarketMovers,
} from '@/lib/mock-data-ui';
import { mockPriceData } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function Dashboard() {
  // Market indices (hardcoded for now)
  const indices = [
    { symbol: 'SPY', name: 'S&P 500', price: 4567.89, change: 23.45, change_percent: 0.52 },
    { symbol: 'QQQ', name: 'NASDAQ', price: 15678.34, change: -12.56, change_percent: -0.08 },
    { symbol: 'DIA', name: 'Dow Jones', price: 34567.23, change: 45.67, change_percent: 0.13 },
    { symbol: 'IWM', name: 'Russell 2000', price: 1987.45, change: 8.23, change_percent: 0.42 },
  ];

  // Calculate portfolio summary
  const totalValue = mockPortfolioPositions.reduce((sum, pos) => sum + pos.current_value, 0);
  const totalCost = mockPortfolioPositions.reduce((sum, pos) => sum + (pos.cost_basis * pos.shares), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

  // Watchlist columns
  const watchlistColumns: Column<typeof mockWatchlistStocks[0]>[] = [
    {
      key: 'ticker',
      header: 'Symbol',
      render: (ticker) => (
        <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span>
      ),
    },
    {
      key: 'current_price',
      header: 'Price',
      align: 'right',
      render: (price) => <span className="font-mono">{formatCurrency(price)}</span>,
    },
    {
      key: 'change_percent',
      header: 'Change',
      align: 'right',
      render: (_, row) => <PriceChange value={row.change} percent={row.change_percent} size="sm" />,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening in the markets today.
          </p>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <Card key={index.symbol} variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{index.name}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {index.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <MiniSparkline
                    data={mockPriceData.slice(-10).map(d => d.close)}
                    positive={index.change > 0}
                    height={40}
                  />
                </div>
                <PriceChange value={index.change} percent={index.change_percent} size="sm" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Portfolio Summary & Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Summary */}
          <Card variant="elevated" className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm opacity-90">Total Value</div>
                  <div className="text-4xl font-bold tabular-nums">
                    {formatCurrency(totalValue)}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-sm opacity-90">Total Gain/Loss</div>
                    <div className="text-xl font-semibold tabular-nums">
                      {formatCurrency(totalGainLoss)}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {formatPercent(totalGainLossPercent, 2, true)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockWatchlistStocks}
                columns={watchlistColumns}
                onRowClick={(row) => console.log('Navigate to', row.ticker)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <TrendingUp className="w-5 h-5" />
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketMovers.gainers.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{stock.ticker}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatCurrency(stock.price)}
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-semibold">
                      +{stock.change_percent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <TrendingDown className="w-5 h-5" />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketMovers.losers.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{stock.ticker}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatCurrency(stock.price)}
                      </div>
                    </div>
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      {stock.change_percent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
