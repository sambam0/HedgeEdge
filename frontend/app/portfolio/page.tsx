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
