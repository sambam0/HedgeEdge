'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { PriceChange } from '@/components/ui/price-change';
import { MiniSparkline } from '@/components/charts/mini-sparkline';
import { Wallet, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { alpacaAPI, AlpacaSummary } from '@/lib/api/portfolio';

export default function Home() {
  const { data: indicesData } = useQuery({
    queryKey: ['indices'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/market/indices');
      return res.json();
    },
  });

  const { data: portfolioData, isError: alpacaError, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolio-performance'],
    queryFn: () => alpacaAPI.getSummary(),
    retry: false, // Don't retry Alpaca 503s infinitely
  });

  const topPositions = portfolioData?.positions?.slice(0, 4) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening in the markets today.
          </p>
        </div>

        {/* Portfolio Summary Context & Errors */}
        {alpacaError && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50">
            <CardContent className="p-4 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200">Alpaca Integration Unavailable</p>
                <p className="text-sm text-red-600 dark:text-red-400">Could not connect to Alpaca Markets API. Please check your credentials or network.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Summary */}
        {portfolioData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                portfolioData.account_mode === 'paper'
                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                  : 'bg-green-500/20 text-green-600 dark:text-green-400'
              }`}>
                {portfolioData.account_mode === 'paper' ? 'Paper Trading' : 'Live Account'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Value" value={formatCurrency(portfolioData.total_value)} icon={Wallet} />
              <MetricCard label="Total Gain/Loss" value={formatCurrency(portfolioData.total_gain_loss)} change={portfolioData.total_gain_loss_percent} />
              <MetricCard label="Daily Change" value={formatCurrency(portfolioData.daily_change)} change={portfolioData.daily_change_percent} />
              <MetricCard label="Positions" value={portfolioData.positions_count} />
            </div>
          </div>
        )}

        {/* Top Positions Sparklines */}
        {topPositions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Positions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPositions.map((pos: any) => (
                <Card key={pos.ticker}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{pos.ticker}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                          {formatCurrency(pos.current_value)}
                        </div>
                      </div>
                      <PriceChange value={pos.gain_loss} percent={pos.gain_loss_percent} size="sm" />
                    </div>
                    <MiniSparkline positive={pos.gain_loss_percent >= 0} height={40} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Market Indices */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Indices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {indicesData?.map((index: any) => (
              <Card key={index.symbol}>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{index.name}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums mb-2">
                    {index.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <PriceChange value={index.change} percent={index.change_percent} size="sm" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
