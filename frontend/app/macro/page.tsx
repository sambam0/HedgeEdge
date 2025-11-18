'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { TrendingUp, DollarSign, Users, PieChart } from 'lucide-react';

export default function MacroPage() {
  const { data: macroData, isLoading } = useQuery({
    queryKey: ['macro-indicators'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/macro/indicators');
      if (!res.ok) throw new Error('Failed to fetch macro data');
      return res.json();
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Macro Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track key economic indicators
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Key Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Fed Funds Rate"
                value={`${macroData?.fed_funds_rate?.current || 0}%`}
                change={macroData?.fed_funds_rate?.change}
                icon={DollarSign}
              />
              <MetricCard
                label="CPI Inflation"
                value={`${macroData?.inflation?.cpi?.current || 0}%`}
                icon={TrendingUp}
              />
              <MetricCard
                label="Unemployment Rate"
                value={`${macroData?.unemployment?.current || 0}%`}
                change={macroData?.unemployment?.change}
                icon={Users}
              />
              <MetricCard
                label="GDP Growth"
                value={`${macroData?.gdp?.current || 0}%`}
                change={macroData?.gdp?.change}
                icon={PieChart}
              />
            </div>

            {/* Treasury Yields */}
            <Card>
              <CardHeader>
                <CardTitle>Treasury Yield Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {macroData?.treasury_yields?.curve?.map((item: any) => (
                    <div
                      key={item.maturity}
                      className="p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-lg text-center"
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.maturity}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {item.yield ? `${item.yield}%` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
