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
  CorrelationMatrix,
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
            Showcasing all chart components with mock data and performance optimizations
          </p>
        </div>

        {/* Price Chart with Moving Averages */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Price Chart with Moving Averages
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Click the MA button to toggle 20-day and 50-day moving averages
          </p>
          <PriceChart ticker="AAPL" showMA={false} />
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

        {/* Candlestick Chart with Volume */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Candlestick Chart with Volume Bars
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Toggle volume bars to see trading volume overlay
          </p>
          <CandlestickChart showVolume={true} />
        </section>

        {/* Correlation Matrix */}
        <section className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Asset Correlation Matrix
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Shows correlation between different assets (1.0 = perfect positive correlation, -1.0 = perfect negative correlation)
          </p>
          <CorrelationMatrix />
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

        {/* Performance Notes */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Performance Optimizations
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>All charts use useMemo for expensive data transformations</li>
            <li>Heavy charts can be lazy-loaded with next/dynamic (see lazy-charts.tsx)</li>
            <li>Moving averages calculated only when enabled</li>
            <li>Correlation matrix uses memoized color calculations</li>
            <li>Charts render at 60fps with large datasets</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
