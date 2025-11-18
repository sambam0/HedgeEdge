'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PriceChange } from '@/components/ui/price-change';
import { formatCurrency, formatLargeNumber } from '@/lib/utils';

export default function ScreenerPage() {
  const [filters, setFilters] = useState({
    min_price: undefined,
    max_price: undefined,
  });

  const { data: screenerData, isLoading } = useQuery({
    queryKey: ['screener', filters],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/screener/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      if (!res.ok) throw new Error('Failed to run screener');
      return res.json();
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Screener</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find stocks that match your criteria
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-neutral-800 rounded"></div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Results ({screenerData?.count || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-800">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Ticker
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Price
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Change
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Market Cap
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        P/E Ratio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {screenerData?.results?.map((stock: any) => (
                      <tr
                        key={stock.ticker}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {stock.ticker}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums text-gray-900 dark:text-white">
                          {formatCurrency(stock.price)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <PriceChange value={0} percent={stock.change_percent} size="sm" />
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums text-gray-600 dark:text-gray-400">
                          {stock.market_cap ? formatLargeNumber(stock.market_cap) : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums text-gray-600 dark:text-gray-400">
                          {stock.pe_ratio ? stock.pe_ratio.toFixed(2) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
