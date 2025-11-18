'use client';

import { useMarketMovers } from '@/lib/hooks/useMarket';

export function MarketMoversTable() {
  const { data, isLoading } = useMarketMovers();

  const renderTable = (title: string, stocks: any[] | undefined, isGainers = false) => (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      {isLoading ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-2">
          {stocks?.slice(0, 5).map((stock) => (
            <div key={stock.ticker} className="flex items-center justify-between">
              <div className="font-medium text-gray-900 dark:text-white">
                {stock.ticker}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ${stock.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    stock.change >= 0
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-red-600 dark:text-red-500'
                  }`}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change_percent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {renderTable('Top Gainers', data?.gainers, true)}
      {renderTable('Top Losers', data?.losers)}
    </div>
  );
}
