'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockScreenerResults } from '@/lib/mock-data-ui';
import { formatCurrency, formatLargeNumber } from '@/lib/utils';

export default function Screener() {
  const [filters, setFilters] = useState({
    minMarketCap: '',
    maxMarketCap: '',
    minPE: '',
    maxPE: '',
    minPrice: '',
    maxPrice: '',
  });

  const screenerColumns: Column<typeof mockScreenerResults[0]>[] = [
    {
      key: 'ticker',
      header: 'Symbol',
      sortable: true,
      render: (ticker) => (
        <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      sortable: true,
      render: (price) => <span className="font-mono">{formatCurrency(price)}</span>,
    },
    {
      key: 'market_cap',
      header: 'Market Cap',
      align: 'right',
      sortable: true,
      render: (cap) => formatLargeNumber(cap),
    },
    {
      key: 'pe_ratio',
      header: 'P/E',
      align: 'right',
      sortable: true,
      render: (pe) => <span className="font-mono">{pe?.toFixed(2) || '—'}</span>,
    },
    {
      key: 'change_percent',
      header: 'Change',
      align: 'right',
      sortable: true,
      render: (change) => (
        <span className={`font-mono ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right',
      sortable: true,
      render: (vol) => formatLargeNumber(vol),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Screener</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find stocks that match your criteria
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Market Cap */}
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  Market Cap
                </h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minMarketCap}
                    onChange={(e) => setFilters({ ...filters, minMarketCap: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxMarketCap}
                    onChange={(e) => setFilters({ ...filters, maxMarketCap: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* P/E Ratio */}
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  P/E Ratio
                </h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPE}
                    onChange={(e) => setFilters({ ...filters, minPE: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPE}
                    onChange={(e) => setFilters({ ...filters, maxPE: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  Price
                </h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Apply Filters
              </button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results ({mockScreenerResults.length})</CardTitle>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  Export to CSV
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockScreenerResults}
                columns={screenerColumns}
                onRowClick={(row) => console.log('View stock', row.ticker)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
