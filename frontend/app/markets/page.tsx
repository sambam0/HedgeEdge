'use client';

import { useState } from 'react';
import { StockSearch } from '@/components/markets/stock-search';
import { CompanyInfoCard } from '@/components/markets/company-info-card';
import { MarketMoversTable } from '@/components/markets/market-movers-table';
import { IntradayChart } from '@/components/markets/intraday-chart';
import { useMarketIndices, useQuote } from '@/lib/hooks/useMarket';

export default function MarketsPage() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const { data: indices, isLoading: indicesLoading } = useMarketIndices();
  const { data: quote, isLoading: quoteLoading } = useQuote(selectedTicker);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Markets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time market data and stock analysis
          </p>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicesLoading ? (
            <div className="col-span-4 text-center text-gray-600 dark:text-gray-400">
              Loading indices...
            </div>
          ) : (
            indices?.map((index) => (
              <div
                key={index.symbol}
                className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">{index.name}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${index.price.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium mt-1 ${
                    index.change >= 0
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-red-600 dark:text-red-500'
                  }`}
                >
                  {index.change >= 0 ? '+' : ''}
                  {index.change.toFixed(2)} ({index.change_percent.toFixed(2)}%)
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Market Movers */}
          <div className="lg:col-span-1">
            <MarketMoversTable />
          </div>

          {/* Right Panel - Stock Detail */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
              <StockSearch onSelectStock={setSelectedTicker} />
            </div>

            {/* Current Quote */}
            {quoteLoading ? (
              <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
                <div className="text-gray-600 dark:text-gray-400">Loading quote...</div>
              </div>
            ) : quote ? (
              <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTicker}
                  </h2>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${quote.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-lg ${
                      quote.change >= 0
                        ? 'text-green-600 dark:text-green-500'
                        : 'text-red-600 dark:text-red-500'
                    }`}
                  >
                    {quote.change >= 0 ? '+' : ''}
                    {quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      ${quote.open?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      ${quote.high?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Low</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      ${quote.low?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {quote.volume ? (quote.volume / 1e6).toFixed(2) + 'M' : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Chart */}
            <IntradayChart ticker={selectedTicker} />

            {/* Company Info */}
            <CompanyInfoCard ticker={selectedTicker} />
          </div>
        </div>
      </div>
    </div>
  );
}
