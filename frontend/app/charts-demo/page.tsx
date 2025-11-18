'use client';

import {
  PriceChart,
  PortfolioPerformanceChart,
  DonutChart,
  MiniSparkline,
  YieldCurveChart,
  HeatMap,
  CandlestickChart,
  BarChart,
} from '@/components/charts';
import { mockSectorAllocation } from '@/lib/mock-data';

export default function ChartsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Charts Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showcasing all chart components with mock data
          </p>
        </div>

        {/* Price Chart */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Price Chart
          </h2>
          <PriceChart ticker="AAPL" />
        </section>

        {/* Portfolio Performance */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Portfolio Performance
          </h2>
          <PortfolioPerformanceChart />
        </section>

        {/* Donut Chart */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Sector Allocation
          </h2>
          <DonutChart centerLabel="Total" centerValue="$125K" />
        </section>

        {/* Mini Sparklines */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Mini Sparklines
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Positive Trend</p>
              <MiniSparkline positive={true} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Negative Trend</p>
              <MiniSparkline positive={false} data={[125, 122, 120, 118, 115, 112, 108, 103, 105, 100]} />
            </div>
          </div>
        </section>

        {/* Yield Curve */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Yield Curve
          </h2>
          <YieldCurveChart />
        </section>

        {/* Heat Map */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Sector Performance Heat Map
          </h2>
          <HeatMap />
        </section>

        {/* Candlestick Chart */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Candlestick Chart
          </h2>
          <CandlestickChart />
        </section>

        {/* Bar Chart */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Bar Chart
          </h2>
          <BarChart
            data={mockSectorAllocation}
            dataKey="value"
            nameKey="sector"
            valueFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
        </section>
      </div>
    </div>
  );
}
