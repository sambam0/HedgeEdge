# Workstream 3: Charts & Data Visualization

**Agent Focus:** Interactive charts, visualizations, and data analytics

**Estimated Time:** 4-5 days

**Priority:** MEDIUM (Can start immediately with mock data)

**Dependencies:** NONE - Can start Day 0 with mock data

---

## Overview

Build all chart components and visualizations including:
- Price charts (candlestick, line)
- Portfolio performance charts
- Allocation charts (donut, pie)
- Mini sparklines for trends
- Heat maps for sector performance
- Yield curve visualization
- Correlation matrices

**Key Strategy:** Start immediately with mock data, integrate real data later.

---

## Mock Data Setup (Start Here - Day 0)

### Create Mock Data Utilities
**File:** `frontend/lib/mock-data.ts`

```typescript
export const mockPriceData = [
  { date: '2024-01-01', open: 150, high: 155, low: 148, close: 153, volume: 1000000 },
  { date: '2024-01-02', open: 153, high: 158, low: 151, close: 156, volume: 1200000 },
  { date: '2024-01-03', open: 156, high: 160, low: 154, close: 159, volume: 1100000 },
  { date: '2024-01-04', open: 159, high: 162, low: 157, close: 161, volume: 1300000 },
  { date: '2024-01-05', open: 161, high: 165, low: 159, close: 164, volume: 1400000 },
  { date: '2024-01-08', open: 164, high: 168, low: 162, close: 166, volume: 1250000 },
  { date: '2024-01-09', open: 166, high: 170, low: 164, close: 169, volume: 1350000 },
  { date: '2024-01-10', open: 169, high: 172, low: 167, close: 171, volume: 1450000 },
];

export const mockPortfolioPerformance = [
  { date: '2024-01-01', portfolio: 100000, sp500: 100000 },
  { date: '2024-02-01', portfolio: 102500, sp500: 101200 },
  { date: '2024-03-01', portfolio: 105200, sp500: 102800 },
  { date: '2024-04-01', portfolio: 108900, sp500: 104500 },
  { date: '2024-05-01', portfolio: 112400, sp500: 106300 },
  { date: '2024-06-01', portfolio: 115800, sp500: 108100 },
  { date: '2024-07-01', portfolio: 119500, sp500: 110200 },
];

export const mockSectorAllocation = [
  { sector: 'Technology', value: 45000, percentage: 36 },
  { sector: 'Healthcare', value: 25000, percentage: 20 },
  { sector: 'Financial', value: 20000, percentage: 16 },
  { sector: 'Consumer', value: 15000, percentage: 12 },
  { sector: 'Industrial', value: 12500, percentage: 10 },
  { sector: 'Energy', value: 7500, percentage: 6 },
];

export const mockYieldCurve = [
  { maturity: '3M', yield: 5.2 },
  { maturity: '6M', yield: 5.1 },
  { maturity: '1Y', yield: 4.9 },
  { maturity: '2Y', yield: 4.5 },
  { maturity: '5Y', yield: 4.2 },
  { maturity: '10Y', yield: 4.3 },
  { maturity: '30Y', yield: 4.5 },
];

export const mockSparklineData = [100, 105, 103, 108, 112, 115, 118, 120, 122, 125];

export const mockHeatMapData = [
  { sector: 'Technology', performance: 2.5 },
  { sector: 'Healthcare', performance: 1.2 },
  { sector: 'Financial', performance: -0.8 },
  { sector: 'Consumer', performance: 1.5 },
  { sector: 'Industrial', performance: 0.3 },
  { sector: 'Energy', performance: -1.2 },
  { sector: 'Materials', performance: -0.5 },
  { sector: 'Real Estate', performance: 0.8 },
  { sector: 'Utilities', performance: 0.2 },
];
```

---

## Task Breakdown

### 1. Price Chart Component (Day 1)

#### 1.1 Install chart dependencies
```bash
cd frontend
npm install recharts
```

#### 1.2 Create Price Chart Component
**File:** `frontend/components/charts/price-chart.tsx`

```tsx
'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockPriceData } from '@/lib/mock-data';

type ChartType = 'line' | 'area' | 'candlestick';
type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface PriceChartProps {
  ticker?: string;
  data?: any[];
  height?: number;
}

export function PriceChart({ ticker, data, height = 400 }: PriceChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');

  // Use mock data if no data provided
  const chartData = data || mockPriceData;

  const timeframes: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'line' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'area' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'
            }`}
          >
            Area
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 2. Portfolio Performance Chart (Day 1)

**File:** `frontend/components/charts/portfolio-performance-chart.tsx`

```tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockPortfolioPerformance } from '@/lib/mock-data';

interface PortfolioPerformanceChartProps {
  data?: any[];
  height?: number;
}

export function PortfolioPerformanceChart({
  data,
  height = 300,
}: PortfolioPerformanceChartProps) {
  const chartData = data || mockPortfolioPerformance;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Your Portfolio"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="sp500"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="S&P 500"
          dot={false}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 3. Donut Chart for Allocation (Day 2)

**File:** `frontend/components/charts/donut-chart.tsx`

```tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockSectorAllocation } from '@/lib/mock-data';

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Healthcare: '#10b981',
  Financial: '#f59e0b',
  Consumer: '#ec4899',
  Industrial: '#6b7280',
  Energy: '#f97316',
  Materials: '#8b5cf6',
  'Real Estate': '#06b6d4',
  Utilities: '#84cc16',
  Communication: '#a855f7',
};

interface DonutChartProps {
  data?: any[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 300,
}: DonutChartProps) {
  const chartData = data || mockSectorAllocation;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={SECTOR_COLORS[entry.sector] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {centerLabel && centerValue && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-sm text-gray-500 dark:text-gray-400">{centerLabel}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{centerValue}</div>
        </div>
      )}
    </div>
  );
}
```

---

### 4. Mini Sparkline (Day 2)

**File:** `frontend/components/charts/mini-sparkline.tsx`

```tsx
'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { mockSparklineData } from '@/lib/mock-data';

interface MiniSparklineProps {
  data?: number[];
  positive?: boolean;
  height?: number;
}

export function MiniSparkline({ data, positive = true, height = 48 }: MiniSparklineProps) {
  const sparklineData = (data || mockSparklineData).map((value, index) => ({
    index,
    value,
  }));

  const color = positive ? '#16a34a' : '#dc2626';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={sparklineData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 5. Yield Curve Chart (Day 3)

**File:** `frontend/components/charts/yield-curve-chart.tsx`

```tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockYieldCurve } from '@/lib/mock-data';

interface YieldCurveChartProps {
  data?: any[];
  height?: number;
}

export function YieldCurveChart({ data, height = 300 }: YieldCurveChartProps) {
  const chartData = data || mockYieldCurve;

  // Check if inverted (2Y > 10Y)
  const twoYear = chartData.find(d => d.maturity === '2Y')?.yield || 0;
  const tenYear = chartData.find(d => d.maturity === '10Y')?.yield || 0;
  const isInverted = twoYear > tenYear;

  return (
    <div className="space-y-2">
      {isInverted && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ⚠️ Yield curve is inverted - potential recession indicator
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="maturity" stroke="#6b7280" fontSize={12} />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'dataMax + 0.5']}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke={isInverted ? '#f59e0b' : '#3b82f6'}
            strokeWidth={3}
            dot={{ fill: isInverted ? '#f59e0b' : '#3b82f6', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 6. Heat Map Component (Day 3)

**File:** `frontend/components/charts/heat-map.tsx`

```tsx
'use client';

import { mockHeatMapData } from '@/lib/mock-data';

interface HeatMapProps {
  data?: Array<{ sector: string; performance: number }>;
}

export function HeatMap({ data }: HeatMapProps) {
  const heatMapData = data || mockHeatMapData;

  const getColor = (performance: number) => {
    if (performance > 2) return 'bg-green-600';
    if (performance > 1) return 'bg-green-500';
    if (performance > 0.5) return 'bg-green-400';
    if (performance > 0) return 'bg-green-300';
    if (performance > -0.5) return 'bg-red-300';
    if (performance > -1) return 'bg-red-400';
    if (performance > -2) return 'bg-red-500';
    return 'bg-red-600';
  };

  const getTextColor = (performance: number) => {
    return Math.abs(performance) > 0.5 ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {heatMapData.map((item) => (
        <div
          key={item.sector}
          className={`${getColor(item.performance)} ${getTextColor(
            item.performance
          )} p-4 rounded-lg text-center transition-transform hover:scale-105 cursor-pointer`}
        >
          <div className="font-semibold text-sm mb-1">{item.sector}</div>
          <div className="text-lg font-bold">
            {item.performance > 0 ? '+' : ''}
            {item.performance.toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 7. Candlestick Chart (Day 4) - Advanced

**File:** `frontend/components/charts/candlestick-chart.tsx`

```tsx
'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mockPriceData } from '@/lib/mock-data';

interface CandlestickChartProps {
  data?: any[];
  height?: number;
}

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const chartData = data || mockPriceData;

  // Transform data for candlestick representation
  const candleData = chartData.map((item) => ({
    ...item,
    range: [item.low, item.high],
    body: item.close > item.open ? [item.open, item.close] : [item.close, item.open],
    isGain: item.close > item.open,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={candleData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          domain={['dataMin - 5', 'dataMax + 5']}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
          formatter={(value: any, name: string) => {
            if (name === 'range') return null;
            if (name === 'body') return null;
            return [`$${value}`, name];
          }}
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          }
        />

        {/* High-Low Range (Wicks) */}
        <Bar dataKey="range" fill="none" stroke="#6b7280" strokeWidth={2} />

        {/* Open-Close Body (Candle) */}
        <Bar dataKey="body" barSize={20}>
          {candleData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isGain ? '#16a34a' : '#dc2626'}
              stroke={entry.isGain ? '#16a34a' : '#dc2626'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

---

### 8. Bar Chart Component (Day 4)

**File:** `frontend/components/charts/bar-chart.tsx`

```tsx
'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  color = '#3b82f6',
  valueFormatter = (value) => value.toString(),
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={nameKey} stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={valueFormatter} />
        <Tooltip
          formatter={(value: number) => valueFormatter(value)}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

---

### 9. Chart Export & Utilities (Day 5)

#### 9.1 Create chart utilities
**File:** `frontend/lib/chart-utils.ts`

```typescript
export function downloadChartAsImage(chartElement: HTMLElement, filename: string) {
  // This would use html2canvas or similar library
  // Simplified version for now
  console.log('Export chart as image:', filename);
  // TODO: Implement actual image export
}

export function prepareChartData(rawData: any[], interval: string) {
  // Filter/transform data based on interval
  switch (interval) {
    case '1D':
      return rawData.slice(-1);
    case '5D':
      return rawData.slice(-5);
    case '1M':
      return rawData.slice(-30);
    case '3M':
      return rawData.slice(-90);
    case '6M':
      return rawData.slice(-180);
    case '1Y':
      return rawData.slice(-365);
    default:
      return rawData;
  }
}

export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
      continue;
    }

    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }

  return result;
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  for (let i = period; i < prices.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}
```

---

### 10. Dark Mode Support (Day 5)

#### 10.1 Update all charts for dark mode

Add to each chart component:

```tsx
const isDark = document.documentElement.classList.contains('dark');

// Update colors based on theme
const gridColor = isDark ? '#374151' : '#e5e7eb';
const textColor = isDark ? '#9ca3af' : '#6b7280';
const tooltipBg = isDark ? '#1f2937' : '#ffffff';
const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
```

Or use CSS variables approach:

**Add to `globals.css`:**

```css
:root {
  --chart-grid: #e5e7eb;
  --chart-text: #6b7280;
  --chart-tooltip-bg: #ffffff;
  --chart-tooltip-border: #e5e7eb;
}

.dark {
  --chart-grid: #374151;
  --chart-text: #9ca3af;
  --chart-tooltip-bg: #1f2937;
  --chart-tooltip-border: #374151;
}
```

---

## Integration with Real Data (Week 2)

Once Workstream 2 (Frontend Data) is complete, replace mock data:

### Example: Price Chart with Real Data

```tsx
'use client';

import { useChartData } from '@/lib/hooks/useMarket';
import { PriceChart } from './price-chart';

export function LivePriceChart({ ticker }: { ticker: string }) {
  const { data, isLoading } = useChartData(ticker, 'daily');

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-[400px]" />;
  }

  return <PriceChart ticker={ticker} data={data?.data} />;
}
```

---

## Testing Checklist

- [ ] All charts render with mock data
- [ ] Timeframe selection works
- [ ] Chart type switching works
- [ ] Tooltips display correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode colors work
- [ ] Performance good with large datasets
- [ ] Export functionality works
- [ ] Technical indicators calculate correctly
- [ ] Legends display properly

---

## Performance Optimization

### Memoize expensive calculations

```tsx
import { useMemo } from 'react';

const processedData = useMemo(() => {
  return prepareChartData(rawData, interval);
}, [rawData, interval]);
```

### Lazy load charts

```tsx
import dynamic from 'next/dynamic';

const CandlestickChart = dynamic(() => import('./candlestick-chart'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false,
});
```

---

## Completion Criteria

✅ All chart components built and tested with mock data
✅ Charts responsive across devices
✅ Dark mode fully supported
✅ Performance optimized (60fps)
✅ Export functionality implemented
✅ Ready for real data integration
✅ Documentation complete
