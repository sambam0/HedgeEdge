'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PriceChange } from '@/components/ui/price-change';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function WatchlistPage() {
  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['watchlist-quotes'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/watchlist/1/quotes');
      if (!res.ok) throw new Error('Failed to fetch watchlist');
      return res.json();
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your favorite stocks
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-neutral-800 rounded"></div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{watchlistData?.name} ({watchlistData?.stocks?.length || 0})</CardTitle>
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
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {watchlistData?.stocks?.map((stock: any) => (
                      <tr
                        key={stock.id}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
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
                          <PriceChange
                            value={stock.change}
                            percent={stock.change_percent}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums text-gray-600 dark:text-gray-400">
                          {formatNumber(stock.volume, true)}
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
