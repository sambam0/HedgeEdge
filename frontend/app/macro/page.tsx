'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { YieldCurveChart } from '@/components/charts/yield-curve-chart';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { mockMacroIndicators } from '@/lib/mock-data-ui';

export default function Macro() {
  const indicators = [
    {
      name: 'Fed Funds Rate',
      value: mockMacroIndicators.fed_funds_rate,
      unit: '%',
      change: 0.25,
      icon: Activity,
    },
    {
      name: 'CPI (Inflation)',
      value: mockMacroIndicators.cpi,
      unit: '%',
      change: -0.3,
      icon: TrendingDown,
    },
    {
      name: 'Unemployment',
      value: mockMacroIndicators.unemployment,
      unit: '%',
      change: -0.1,
      icon: TrendingDown,
    },
    {
      name: 'GDP Growth',
      value: mockMacroIndicators.gdp,
      unit: '%',
      change: 0.2,
      icon: TrendingUp,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Macro Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track economic indicators and market conditions
          </p>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((indicator) => {
            const Icon = indicator.icon;
            const isPositive = indicator.change > 0;

            return (
              <Card key={indicator.name} variant="elevated">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {indicator.name}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {indicator.value.toFixed(2)}{indicator.unit}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                      <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{indicator.change.toFixed(2)}{indicator.unit} MoM
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Yield Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Treasury Yield Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <YieldCurveChart height={400} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
