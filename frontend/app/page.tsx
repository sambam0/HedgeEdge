'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { PriceChange } from '@/components/ui/price-change';
import { MiniSparkline } from '@/components/charts/mini-sparkline';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { data: indicesData } = useQuery({
    queryKey: ['indices'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/market/indices');
      return res.json();
    },
  });

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio-performance'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/portfolio/1/performance');
      return res.json();
    },
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

        {/* Portfolio Summary */}
        {portfolioData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Value" value={formatCurrency(portfolioData.total_value)} icon={Wallet} />
            <MetricCard label="Total Gain/Loss" value={formatCurrency(portfolioData.total_gain_loss)} change={portfolioData.total_gain_loss_percent} />
            <MetricCard label="Daily Change" value={formatCurrency(portfolioData.daily_change)} change={portfolioData.daily_change_percent} />
            <MetricCard label="Positions" value={portfolioData.positions_count} />
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
