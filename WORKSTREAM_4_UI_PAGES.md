# Workstream 4: UI Components & Pages

**Agent Focus:** User interface components and complete page implementations

**Estimated Time:** 5-7 days

**Priority:** MEDIUM (Can start immediately with mock data)

**Dependencies:** NONE - Can start Day 0 with mock data, integrate real data later

---

## Overview

Build all UI components and complete page implementations including:
- Reusable UI components (DataTable, Modal, Tabs, etc.)
- Complete Dashboard page
- Complete Portfolio page
- Complete Screener page
- Complete Stock Detail page
- Complete Macro Dashboard page
- Responsive layouts for all breakpoints

**Key Strategy:** Start with mock data, build complete UI/UX, integrate real data later.

---

## Mock Data for UI (Day 0)

**File:** `frontend/lib/mock-data-ui.ts`

```typescript
export const mockPortfolioPositions = [
  {
    id: 1,
    ticker: 'AAPL',
    shares: 50,
    cost_basis: 150.00,
    current_price: 175.43,
    current_value: 8771.50,
    profit_loss: 1271.50,
    profit_loss_percent: 16.95,
  },
  {
    id: 2,
    ticker: 'MSFT',
    shares: 30,
    cost_basis: 300.00,
    current_price: 378.91,
    current_value: 11367.30,
    profit_loss: 2367.30,
    profit_loss_percent: 26.30,
  },
  {
    id: 3,
    ticker: 'GOOGL',
    shares: 20,
    cost_basis: 120.00,
    current_price: 142.65,
    current_value: 2853.00,
    profit_loss: 453.00,
    profit_loss_percent: 18.88,
  },
  {
    id: 4,
    ticker: 'TSLA',
    shares: 15,
    cost_basis: 250.00,
    current_price: 242.84,
    current_value: 3642.60,
    profit_loss: -107.40,
    profit_loss_percent: -2.86,
  },
];

export const mockWatchlistStocks = [
  { id: 1, ticker: 'NVDA', current_price: 495.22, change: 8.34, change_percent: 1.71 },
  { id: 2, ticker: 'AMD', current_price: 165.89, change: -2.11, change_percent: -1.26 },
  { id: 3, ticker: 'META', current_price: 488.50, change: 5.22, change_percent: 1.08 },
  { id: 4, ticker: 'NFLX', current_price: 612.33, change: -4.67, change_percent: -0.76 },
];

export const mockMarketMovers = {
  gainers: [
    { ticker: 'NVDA', price: 495.22, change_percent: 5.43 },
    { ticker: 'META', price: 488.50, change_percent: 4.22 },
    { ticker: 'AMD', price: 165.89, change_percent: 3.89 },
  ],
  losers: [
    { ticker: 'TSLA', price: 242.84, change_percent: -3.42 },
    { ticker: 'PYPL', price: 61.45, change_percent: -2.87 },
    { ticker: 'SNAP', price: 14.23, change_percent: -2.35 },
  ],
};

export const mockScreenerResults = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    market_cap: 2700000000000,
    pe_ratio: 28.5,
    change_percent: 1.35,
    volume: 52000000,
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    market_cap: 2820000000000,
    pe_ratio: 35.2,
    change_percent: 0.89,
    volume: 24000000,
  },
  // Add more...
];

export const mockMacroIndicators = {
  fed_funds_rate: 5.33,
  cpi: 3.2,
  unemployment: 3.8,
  gdp: 2.4,
};
```

---

## Task Breakdown

### 1. DataTable Component (Day 1 - Critical Foundation)

**File:** `frontend/components/ui/data-table.tsx`

```tsx
'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor?: (row: T, index: number) => string | number;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  keyExtractor = (_, index) => index,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const key = column.key as string;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;

    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue === bValue) return 0;

    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const key = column.key as string;

    if (sortKey !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700' : ''}`}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1 justify-between">
                  <span>{column.header}</span>
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row, rowIndex)}
              className={`${
                onRowClick
                  ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors'
                  : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => {
                const value = row[column.key as keyof T];
                const rendered = column.render ? column.render(value, row) : value;

                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm text-gray-900 dark:text-white ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {rendered}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 2. Modal Component (Day 1)

**File:** `frontend/components/ui/modal.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-neutral-900 rounded-xl shadow-2xl transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

---

### 3. Tabs Component (Day 1)

**File:** `frontend/components/ui/tabs.tsx`

```tsx
'use client';

import { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-neutral-800">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-neutral-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{activeTabContent}</div>
    </div>
  );
}
```

---

### 4. Complete Dashboard Page (Day 2-3)

**File:** `frontend/app/page.tsx` (update existing)

```tsx
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { PriceChange } from '@/components/ui/price-change';
import { DataTable, Column } from '@/components/ui/data-table';
import { MiniSparkline } from '@/components/charts/mini-sparkline';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  mockPortfolioPositions,
  mockWatchlistStocks,
  mockMarketMovers,
} from '@/lib/mock-data-ui';
import { mockPriceData } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function Dashboard() {
  // Market indices (hardcoded for now)
  const indices = [
    { symbol: 'SPY', name: 'S&P 500', price: 4567.89, change: 23.45, change_percent: 0.52 },
    { symbol: 'QQQ', name: 'NASDAQ', price: 15678.34, change: -12.56, change_percent: -0.08 },
    { symbol: 'DIA', name: 'Dow Jones', price: 34567.23, change: 45.67, change_percent: 0.13 },
    { symbol: 'IWM', name: 'Russell 2000', price: 1987.45, change: 8.23, change_percent: 0.42 },
  ];

  // Calculate portfolio summary
  const totalValue = mockPortfolioPositions.reduce((sum, pos) => sum + pos.current_value, 0);
  const totalCost = mockPortfolioPositions.reduce((sum, pos) => sum + (pos.cost_basis * pos.shares), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

  // Watchlist columns
  const watchlistColumns: Column<typeof mockWatchlistStocks[0]>[] = [
    {
      key: 'ticker',
      header: 'Symbol',
      render: (ticker) => (
        <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span>
      ),
    },
    {
      key: 'current_price',
      header: 'Price',
      align: 'right',
      render: (price) => <span className="font-mono">{formatCurrency(price)}</span>,
    },
    {
      key: 'change_percent',
      header: 'Change',
      align: 'right',
      render: (_, row) => <PriceChange value={row.change} percent={row.change_percent} size="sm" />,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening in the markets today.
          </p>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <Card key={index.symbol} variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{index.name}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {index.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <MiniSparkline
                    data={mockPriceData.slice(-10).map(d => d.close)}
                    positive={index.change > 0}
                    height={40}
                  />
                </div>
                <PriceChange value={index.change} percent={index.change_percent} size="sm" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Portfolio Summary & Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Summary */}
          <Card variant="elevated" className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm opacity-90">Total Value</div>
                  <div className="text-4xl font-bold tabular-nums">
                    {formatCurrency(totalValue)}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-sm opacity-90">Total Gain/Loss</div>
                    <div className="text-xl font-semibold tabular-nums">
                      {formatCurrency(totalGainLoss)}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {formatPercent(totalGainLossPercent, 2, true)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockWatchlistStocks}
                columns={watchlistColumns}
                onRowClick={(row) => console.log('Navigate to', row.ticker)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <TrendingUp className="w-5 h-5" />
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketMovers.gainers.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{stock.ticker}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatCurrency(stock.price)}
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-semibold">
                      +{stock.change_percent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <TrendingDown className="w-5 h-5" />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketMovers.losers.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{stock.ticker}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatCurrency(stock.price)}
                      </div>
                    </div>
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      {stock.change_percent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
```

---

### 5. Complete Portfolio Page (Day 3-4)

**File:** `frontend/app/portfolio/page.tsx` (update existing)

```tsx
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { PortfolioPerformanceChart } from '@/components/charts/portfolio-performance-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';
import { mockPortfolioPositions, mockSectorAllocation } from '@/lib/mock-data-ui';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { PriceChange } from '@/components/ui/price-change';

export default function Portfolio() {
  const [showAddPosition, setShowAddPosition] = useState(false);

  // Calculate metrics
  const totalValue = mockPortfolioPositions.reduce((sum, pos) => sum + pos.current_value, 0);
  const totalCost = mockPortfolioPositions.reduce((sum, pos) => sum + (pos.cost_basis * pos.shares), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

  // Position table columns
  const positionColumns: Column<typeof mockPortfolioPositions[0]>[] = [
    {
      key: 'ticker',
      header: 'Symbol',
      sortable: true,
      render: (ticker) => (
        <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span>
      ),
    },
    {
      key: 'shares',
      header: 'Shares',
      align: 'right',
      sortable: true,
      render: (shares) => <span className="font-mono">{shares}</span>,
    },
    {
      key: 'cost_basis',
      header: 'Avg Cost',
      align: 'right',
      sortable: true,
      render: (cost) => <span className="font-mono">{formatCurrency(cost)}</span>,
    },
    {
      key: 'current_price',
      header: 'Price',
      align: 'right',
      sortable: true,
      render: (price) => <span className="font-mono">{formatCurrency(price)}</span>,
    },
    {
      key: 'current_value',
      header: 'Value',
      align: 'right',
      sortable: true,
      render: (value) => <span className="font-mono font-semibold">{formatCurrency(value)}</span>,
    },
    {
      key: 'profit_loss',
      header: 'P&L',
      align: 'right',
      sortable: true,
      render: (_, row) => (
        <PriceChange value={row.profit_loss} percent={row.profit_loss_percent} size="md" />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded">
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded">
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your positions and performance
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddPosition(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Position
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Value"
            value={formatCurrency(totalValue)}
          />
          <MetricCard
            label="Total Cost"
            value={formatCurrency(totalCost)}
          />
          <MetricCard
            label="Total Gain/Loss"
            value={formatCurrency(totalGainLoss)}
            change={totalGainLossPercent}
          />
          <MetricCard
            label="Positions"
            value={mockPortfolioPositions.length.toString()}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance vs S&P 500</CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioPerformanceChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={mockSectorAllocation}
                centerLabel="Total Value"
                centerValue={formatCurrency(totalValue, true)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Positions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockPortfolioPositions}
              columns={positionColumns}
              onRowClick={(row) => console.log('View details for', row.ticker)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Position Modal */}
      <Modal
        isOpen={showAddPosition}
        onClose={() => setShowAddPosition(false)}
        title="Add Position"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ticker Symbol
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              placeholder="AAPL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Shares
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cost Basis (per share)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              placeholder="150.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddPosition(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Position
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
```

---

### 6. Screener Page (Day 4)

**File:** `frontend/app/screener/page.tsx` (update existing)

```tsx
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
```

---

### 7. Macro Dashboard Page (Day 5)

**File:** `frontend/app/macro/page.tsx` (update existing)

```tsx
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
```

---

## Testing Checklist

- [ ] All components render correctly
- [ ] DataTable sorting works
- [ ] Modal opens/closes correctly
- [ ] Tabs switch correctly
- [ ] Forms validate input
- [ ] All pages responsive (mobile/tablet/desktop)
- [ ] Dark mode works on all pages
- [ ] Navigation works between pages
- [ ] Mock data displays correctly

---

## Integration with Real Data (Week 2)

Replace mock data imports with actual API hooks:

```tsx
// Before
import { mockPortfolioPositions } from '@/lib/mock-data-ui';

// After
import { usePortfolioPositions } from '@/lib/hooks/usePortfolio';

// In component
const { data: positions, isLoading } = usePortfolioPositions(portfolioId);
```

---

## Completion Criteria

✅ All UI components built and tested
✅ All pages complete with mock data
✅ Responsive design implemented
✅ Dark mode supported
✅ Forms functional
✅ Navigation working
✅ Ready for real data integration
