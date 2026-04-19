'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { PriceChange } from '@/components/ui/price-change';
import { formatCurrency, formatLargeNumber } from '@/lib/utils';

interface ScreenerStock {
  ticker: string;
  price: number;
  change: number;
  change_percent: number;
  market_cap: number;
  pe_ratio: number | null;
}

const columns: Column<ScreenerStock>[] = [
  {
    key: 'ticker',
    header: 'Ticker',
    sortable: true,
    render: (value) => (
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    ),
  },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    sortable: true,
    render: (value) => (
      <span className="tabular-nums">{formatCurrency(value)}</span>
    ),
  },
  {
    key: 'change_percent',
    header: 'Change',
    align: 'right',
    sortable: true,
    render: (_value, row) => (
      <PriceChange value={row.change} percent={row.change_percent} size="sm" />
    ),
  },
  {
    key: 'market_cap',
    header: 'Market Cap',
    align: 'right',
    sortable: true,
    render: (value) => (
      <span className="tabular-nums">{formatLargeNumber(value)}</span>
    ),
  },
  {
    key: 'pe_ratio',
    header: 'P/E Ratio',
    align: 'right',
    sortable: true,
    render: (value) => (
      <span className="tabular-nums">{value != null ? value.toFixed(2) : '—'}</span>
    ),
  },
];

export default function ScreenerPage() {
  const [filters] = useState({ min_price: undefined, max_price: undefined });

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

        <Card>
          <CardHeader>
            <CardTitle>Results ({screenerData?.count ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<ScreenerStock>
              data={screenerData?.results ?? []}
              columns={columns}
              loading={isLoading}
              emptyMessage="No stocks match your criteria."
              keyExtractor={(row) => row.ticker}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
