# Principle Design System
**A Comprehensive Design Guide for Your Personal Trading Terminal**

Version: 1.0
Last Updated: November 18, 2025
Project: Principle (formerly HedgeEdge)

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Navigation Architecture](#navigation-architecture)
6. [Screen Designs](#screen-designs)
7. [Component Library](#component-library)
8. [UX Patterns](#ux-patterns)
9. [Data Visualization](#data-visualization)
10. [Animations](#animations)
11. [Responsive Design](#responsive-design)
12. [Accessibility](#accessibility)
13. [Performance](#performance)
14. [Implementation Checklist](#implementation-checklist)

---

## Brand Identity

### Name Philosophy

**Principle** conveys:
- Core investment principles (value, discipline, strategy)
- Principled approach to trading
- Foundation/fundamental analysis focus
- Professional, trustworthy, intelligent

### Brand Attributes

- **Professional** - Serious tool for serious investors
- **Precise** - Accurate data, clear metrics
- **Powerful** - Complex functionality, simple interface
- **Principled** - Data-driven decision making

### Logo Concept

```
┌─────────────────┐
│                 │
│   ╔═══╗         │  Letter "P" with:
│   ║   ║         │  - Clean geometric shape
│   ╠═══╝         │  - Suggests a pillar/foundation
│   ║             │  - Professional, stable
│   ║             │  - Works at any size
│                 │
└─────────────────┘
```

**Logo Colors:**
- Primary mark: Primary-600 (#2563eb)
- On dark: White with subtle glow
- Favicon: Just the "P" symbol

---

## Color System

### Primary Palette

**Primary Blue** (Trust, stability, finance)

```typescript
primary: {
  50: '#eff6ff',   // Very light blue
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Main brand blue
  600: '#2563eb',  // Default buttons, links
  700: '#1d4ed8',  // Hover states
  800: '#1e40af',
  900: '#1e3a8a',  // Dark mode backgrounds
  950: '#172554',
}
```

### Neutral Palette

**Sophisticated Grays**

```typescript
neutral: {
  50: '#fafafa',   // Backgrounds (light mode)
  100: '#f5f5f5',  // Secondary backgrounds
  200: '#e5e5e5',  // Borders
  300: '#d4d4d4',  // Disabled states
  400: '#a3a3a3',  // Placeholders
  500: '#737373',  // Secondary text
  600: '#525252',  // Primary text (light mode)
  700: '#404040',
  800: '#262626',  // Primary text (dark mode)
  900: '#171717',  // Backgrounds (dark mode)
  950: '#0a0a0a',  // Deep dark
}
```

### Semantic Colors (Financial Data)

**Market Colors**

```typescript
market: {
  gain: {
    light: '#22c55e',  // Light mode
    DEFAULT: '#16a34a', // Standard
    dark: '#15803d',   // Dark mode
    bg: '#f0fdf4',     // Background tint
  },
  loss: {
    light: '#ef4444',  // Light mode
    DEFAULT: '#dc2626', // Standard
    dark: '#b91c1c',   // Dark mode
    bg: '#fef2f2',     // Background tint
  },
  neutral: {
    DEFAULT: '#6b7280',
    bg: '#f9fafb',
  },
}
```

**Accent Colors** (Data visualization)

```typescript
accent: {
  purple: '#8b5cf6',  // Volume
  orange: '#f59e0b',  // Warnings
  cyan: '#06b6d4',    // Info
  indigo: '#6366f1',  // Secondary charts
  rose: '#f43f5e',    // Alerts
}
```

### Background System

```typescript
background: {
  primary: '#ffffff',    // Main background (light)
  secondary: '#f9fafb',  // Cards, panels (light)
  tertiary: '#f3f4f6',   // Subtle sections (light)
  dark: {
    primary: '#0a0a0a',    // Main background (dark)
    secondary: '#171717',  // Cards, panels (dark)
    tertiary: '#262626',   // Subtle sections (dark)
  }
}
```

### Chart Colors

```typescript
chart: {
  1: '#3b82f6',  // Blue
  2: '#8b5cf6',  // Purple
  3: '#06b6d4',  // Cyan
  4: '#f59e0b',  // Amber
  5: '#ef4444',  // Red
  6: '#10b981',  // Emerald
  7: '#f97316',  // Orange
  8: '#ec4899',  // Pink
}
```

### Sector Colors

```typescript
sectors: {
  'Technology': '#3b82f6',
  'Healthcare': '#10b981',
  'Financial': '#f59e0b',
  'Consumer': '#ec4899',
  'Industrial': '#6b7280',
  'Energy': '#f97316',
  'Materials': '#8b5cf6',
  'Real Estate': '#06b6d4',
  'Utilities': '#84cc16',
  'Communication': '#a855f7',
}
```

### Color Usage Rules

**Consistent Color Language:**
- 🟢 Green = Positive/Gain (NEVER for "go" or "yes")
- 🔴 Red = Negative/Loss (NEVER for "stop" or "no")
- 🔵 Blue = Neutral/Information
- ⚫ Gray = Secondary/Inactive

---

## Typography

### Font Families

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  display: ['Inter', 'system-ui', 'sans-serif'],
}
```

**Why These Fonts?**
- **Inter**: Clean, modern, highly legible at all sizes
- **JetBrains Mono**: Tabular numbers for perfect alignment in tables

### Typography Scale

**Display Sizes** (Hero sections)

```typescript
'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
```

**Financial Data Sizes**

```typescript
'price-xl': ['2.25rem', { lineHeight: '1.2', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }],
'price-lg': ['1.875rem', { lineHeight: '1.2', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }],
'price-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }],
'price-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '500', fontVariantNumeric: 'tabular-nums' }],
```

**Ticker Symbols**

```typescript
'ticker-lg': ['1rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }],
'ticker-md': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }],
'ticker-sm': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '500' }],
```

**Data Tables**

```typescript
'table-header': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }],
'table-data': ['0.875rem', { lineHeight: '1.5', fontVariantNumeric: 'tabular-nums' }],
```

### Typography Rules

1. **All financial figures use monospaced fonts** (JetBrains Mono)
2. **Ticker symbols are uppercase** with slight letter-spacing
3. **Headlines use Inter** with tight line-height
4. **Body text uses Inter** at 1rem (16px) base size
5. **Use tabular-nums** for all numeric data in tables

---

## Spacing & Layout

### Spacing System

**Base: 4px (0.25rem)**

```
Scale:
1  = 4px   (0.25rem)
2  = 8px   (0.5rem)  - Tight spacing
3  = 12px  (0.75rem)
4  = 16px  (1rem)    - Standard spacing
6  = 24px  (1.5rem)  - Section spacing
8  = 32px  (2rem)    - Large spacing
12 = 48px  (3rem)    - Component separation
16 = 64px  (4rem)    - Page sections
```

### Component Padding

```
Cards:    p-6 (24px)
Buttons:  px-4 py-2 (16px/8px)
Inputs:   px-3 py-2 (12px/8px)
Tables:   px-4 py-3 (16px/12px)
Modals:   p-6 or p-8 (24px or 32px)
```

### Border Radius

```typescript
borderRadius: {
  'sm': '0.25rem',   // 4px - small elements
  'md': '0.375rem',  // 6px - buttons, inputs
  'lg': '0.5rem',    // 8px - cards
  'xl': '0.75rem',   // 12px - modals
  '2xl': '1rem',     // 16px - large containers
}
```

### Shadows (Depth System)

```typescript
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Elevated cards
  'card': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
  'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.12)',

  // Inner shadows for inputs
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // Glow effects for gains/losses
  'gain': '0 0 20px -5px rgb(34 197 94 / 0.3)',
  'loss': '0 0 20px -5px rgb(239 68 68 / 0.3)',
}
```

---

## Navigation Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Top Bar (64px)                                         │
│  [Logo] [Search] [Portfolio: $125K ↑2.3%] [Settings]  │
├──────┬──────────────────────────────────────────────────┤
│      │                                                  │
│ Side │  Main Content Area                              │
│ Nav  │  (Dynamic based on route)                        │
│ 240px│                                                  │
│      │                                                  │
│      │                                                  │
│      │                                                  │
└──────┴──────────────────────────────────────────────────┘
```

### Sidebar Navigation

**Primary Navigation:**
- Dashboard (LayoutDashboard icon)
- Portfolio (Wallet icon) - Shows live P&L badge
- Markets (TrendingUp icon)
- Screener (Search icon)
- Watchlist (Star icon) - Shows stock count badge
- Macro (Globe2 icon)
- Analysis (BarChart3 icon)
- News (Newspaper icon) - Shows unread count badge

**Secondary Navigation:**
- Settings (Settings icon)

**Fixed Bottom:**
- Market Status Indicator (Open/Closed with next event time)

### Top Bar Components

1. **Global Search** (Left)
   - Search stocks, news, analysis
   - Keyboard shortcut: ⌘K
   - Command palette UI

2. **Quick Stats** (Right)
   - Portfolio value and daily P&L
   - Major indices (SPY, QQQ, DIA) - desktop only
   - Notifications
   - Theme toggle
   - User menu

### Mobile Navigation

**Bottom Tab Bar** (< 768px)
- Dashboard
- Portfolio
- Markets
- Screener
- More (opens menu)

---

## Screen Designs

### 1. Dashboard Screen

**Layout Grid:**
```
┌─────────────────────────────────────────────────┐
│ Page Header                                     │
├─────────────────────────────────────────────────┤
│ [S&P 500]  [NASDAQ]  [DOW]  [Russell 2000]     │  ← Index Cards
├───────────────────────────┬─────────────────────┤
│                           │                     │
│ Portfolio Summary Card    │  Watchlist         │
│ (Gradient, hero style)    │                     │
│                           │                     │
├───────────────────────────┼─────────────────────┤
│                           │                     │
│ Portfolio Performance     │  Market Movers     │
│ Chart                     │  (Gainers/Losers)  │
│                           │                     │
├───────────────────────────┼─────────────────────┤
│                           │                     │
│ Top Positions Table       │  Sector Heat Map   │
│                           │                     │
├───────────────────────────┴─────────────────────┤
│ Market News Feed                                │
└─────────────────────────────────────────────────┘
```

**Key Components:**
- Index Cards with sparklines
- Portfolio Summary (gradient card with key metrics)
- Performance chart (vs S&P 500)
- Top 5 positions table
- Live watchlist prices
- Market movers (top gainers/losers)
- Sector heat map
- News feed (latest 5 articles)

### 2. Portfolio Screen

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Page Header + Actions (Export, Add Position)   │
├─────────────────────────────────────────────────┤
│ [Total Value] [Total Cost] [P&L] [Cash]        │  ← Metric Cards
├───────────────────────────┬─────────────────────┤
│                           │                     │
│ Performance vs S&P 500    │  Allocation        │
│ Chart                     │  (Sector/Position) │
│                           │                     │
├───────────────────────────┴─────────────────────┤
│                                                 │
│ Positions Table                                 │
│ (Ticker, Shares, Cost, Price, Value, P&L, %)   │
│                                                 │
├─────────────────────────────────────────────────┤
│ Risk Analytics                                  │
│ [Beta] [Sharpe] [Max Drawdown]                 │
│ Correlation Matrix                              │
└─────────────────────────────────────────────────┘
```

**Key Features:**
- Comprehensive positions table with all metrics
- Interactive charts (performance, allocation)
- Risk analytics (beta, Sharpe ratio, correlations)
- Quick actions (edit, close position)
- Export functionality

### 3. Stock Screener

**Layout:**
```
┌──────────┬──────────────────────────────────────┐
│          │ Page Header + Actions                │
│          ├──────────────────────────────────────┤
│ Filters  │                                      │
│ Sidebar  │ Results Table                        │
│ (240px)  │ (Ticker, Price, P/E, Growth, etc.)  │
│          │                                      │
│          │ Sortable, searchable, paginated     │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

**Filter Categories:**
- Saved Screens
- Market Cap
- Sector
- Valuation (P/E, P/B, PEG)
- Profitability (ROE, Margins)
- Growth (Revenue, Earnings)
- Dividends (Yield, Payout Ratio)
- Financial Health (Debt/Equity, Current Ratio)

**Results Table:**
- Sortable columns
- Click row to view stock details
- Export to CSV
- Save screen functionality

### 4. Stock Detail Page

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [AAPL] Apple Inc.              [Add to WL]     │
│ $175.43  +$2.34 (+1.35%)                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ Price Chart (Multiple timeframes)              │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Overview] [Financials] [Ratios] [Peers]      │  ← Tabs
│ [Ownership] [News]                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Tab Content                                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Tabs:**
1. **Overview** - Key stats snapshot
2. **Financials** - Income statement, balance sheet, cash flow
3. **Ratios** - Comprehensive ratios dashboard
4. **Peers** - Comparison with competitors
5. **Ownership** - Insider and institutional holdings
6. **News** - Company-specific news feed

---

## Component Library

### 1. Card Component

**Variants:**
- `default` - White background, border, shadow
- `elevated` - Stronger shadow, no border
- `bordered` - Thicker border, no shadow
- `ghost` - Subtle background, no border

**Padding Options:**
- `none` - No padding
- `sm` - 16px (p-4)
- `md` - 24px (p-6) - Default
- `lg` - 32px (p-8)

```tsx
<Card variant="default" padding="md">
  {/* Content */}
</Card>
```

### 2. Badge Component

**Variants:**
- `default` - Gray
- `gain` - Green background
- `loss` - Red background
- `neutral` - Gray
- `info` - Blue
- `warning` - Amber

**Sizes:**
- `sm` - Small (text-xs)
- `md` - Medium (text-sm) - Default
- `lg` - Large (text-base)

```tsx
<Badge variant="gain" size="md">+2.3%</Badge>
```

### 3. PriceChange Component

**Props:**
- `value` - Numeric change value
- `percent` - Percentage change (optional)
- `size` - 'sm' | 'md' | 'lg'
- `showIcon` - Show trending arrow (default: true)
- `animate` - Animate on change (default: true)

```tsx
<PriceChange value={2.34} percent={1.35} size="md" />
```

**Behavior:**
- Auto-detects positive/negative
- Shows appropriate color (green/red)
- Displays trending icon
- Animates on price update

### 4. LivePrice Component

**Props:**
- `ticker` - Stock symbol
- `showChange` - Show price change (default: true)
- `className` - Additional styles

**Features:**
- Auto-updates every 15-30 seconds
- Flash effect on price change
- Shows timestamp
- Color-coded change

```tsx
<LivePrice ticker="AAPL" showChange={true} />
```

### 5. MetricCard Component

**Props:**
- `label` - Metric name
- `value` - Metric value
- `change` - Change indicator (optional)
- `changeType` - 'gain' | 'loss' | 'neutral'
- `icon` - Icon component (optional)
- `trend` - Sparkline data (optional)

```tsx
<MetricCard
  label="Total Value"
  value="$125,432.50"
  change="+2.3%"
  changeType="gain"
  icon={TrendingUp}
  trend={[100, 105, 103, 108, 112]}
/>
```

### 6. DataTable Component

**Features:**
- Sortable columns
- Keyboard navigation
- Row click handlers
- Loading states
- Empty states
- Custom cell renderers

```tsx
<DataTable
  data={positions}
  columns={[
    { key: 'ticker', header: 'Symbol', sortable: true },
    { key: 'price', header: 'Price', align: 'right', render: (val) => formatCurrency(val) },
  ]}
  onRowClick={(row) => navigate(`/stock/${row.ticker}`)}
/>
```

### 7. Skeleton Components

**Types:**
- `Skeleton` - Basic skeleton
- `CardSkeleton` - Card layout skeleton
- `TableSkeleton` - Table skeleton with rows/columns

```tsx
{isLoading ? (
  <CardSkeleton />
) : (
  <Card>{data}</Card>
)}
```

### 8. EmptyState Component

**Props:**
- `icon` - Icon component
- `title` - Empty state title
- `description` - Description text
- `action` - Action button config (optional)

```tsx
<EmptyState
  icon={Search}
  title="No stocks found"
  description="Try adjusting your filters"
  action={{ label: 'Clear Filters', onClick: clearFilters }}
/>
```

### 9. Chart Components

**MiniSparkline**
- Small line chart for trends
- Auto-scales to container
- Color-coded (gain/loss)

```tsx
<MiniSparkline data={prices} positive={true} height={48} />
```

**DonutChart**
- Sector/position allocation
- Center label with value
- Custom colors per segment

```tsx
<DonutChart
  data={sectors}
  centerLabel="Total Value"
  centerValue="$125K"
/>
```

---

## UX Patterns

### 1. Price Update Pattern

**Visual Feedback:**
- Flash background color on price change
- Green flash for increase
- Red flash for decrease
- 500ms animation duration

```tsx
// Implementation
useEffect(() => {
  if (quote.price > previousPrice) {
    setFlashColor('gain')
  } else if (quote.price < previousPrice) {
    setFlashColor('loss')
  }
  setTimeout(() => setFlashColor('none'), 500)
}, [quote.price])
```

### 2. Progressive Disclosure

**Show summary, expand for details:**
- Cards start collapsed
- Click/tap to expand
- Smooth slide-down animation
- Remember expanded state

**Use Cases:**
- Position details in portfolio
- Financial statement line items
- News article previews

### 3. Contextual Actions

**Hover to reveal actions:**
- Actions hidden by default
- Appear on row hover
- Quick access to common tasks
- Doesn't clutter interface

**Actions:**
- Add to watchlist
- View chart
- View analysis
- Edit position
- Close position

### 4. Rich Tooltips

**Show on hover:**
- Live stock data
- Mini chart
- Key metrics
- Company info

**Benefits:**
- Quick context without navigation
- Reduces clicks
- Maintains focus

### 5. Data Density Control

**User preference:**
- Compact (more data, less space)
- Comfortable (balanced) - Default
- Spacious (easier reading)

**Applies to:**
- Tables
- Lists
- Cards

### 6. Comparison Pattern

**Side-by-side cards:**
- Compare multiple stocks
- Aligned metrics
- Visual differentiation
- Quick scanning

### 7. Timeframe Selection

**Common patterns:**
- 1D, 1W, 1M, 3M, 1Y, YTD, ALL
- Pill-style selector
- Adaptive chart intervals
- Persistent selection

---

## Data Visualization

### Chart Color Palette

**Primary Series:**
```typescript
const chartColors = {
  primary: '#3b82f6',    // Portfolio/main data
  secondary: '#8b5cf6',  // Benchmark (S&P 500)
  tertiary: '#06b6d4',   // Comparison
  gain: '#16a34a',       // Positive values
  loss: '#dc2626',       // Negative values
  neutral: '#6b7280',    // Unchanged
}
```

**Multi-Series:**
```typescript
const seriesColors = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f97316', // Orange
  '#ec4899', // Pink
]
```

### Chart Types

**Line Charts:**
- Portfolio performance over time
- Price charts
- Trend analysis

**Candlestick Charts:**
- Stock price action
- OHLC data
- Volume overlay

**Bar Charts:**
- Volume
- Comparison metrics
- Historical data

**Donut/Pie Charts:**
- Sector allocation
- Position concentration
- Asset allocation

**Heat Maps:**
- Sector performance
- Correlation matrix
- Market overview

### Accessibility in Charts

- Use patterns in addition to colors
- Provide data table alternative
- Keyboard navigation for interactive charts
- Screen reader descriptions
- High contrast mode support

---

## Animations

### Duration Scale

```typescript
const durations = {
  instant: '100ms',   // Hover states
  fast: '200ms',      // Micro-interactions
  normal: '300ms',    // Standard transitions
  slow: '500ms',      // Page transitions
  verySlow: '1000ms', // Loading states
}
```

### Easing Functions

```typescript
const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}
```

### Animation Guidelines

**When to Animate:**
- ✅ Price updates (flash effect)
- ✅ Chart interactions (crosshair, tooltips)
- ✅ Modal/dialog entrance
- ✅ Hover states on cards
- ✅ Loading states
- ✅ Page transitions

**When NOT to Animate:**
- ❌ Table sorting (instant)
- ❌ Tab switching (instant or very fast)
- ❌ Data updates in tables (can be distracting)

### Custom Animations

```typescript
animation: {
  'fade-in': 'fadeIn 0.3s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'shimmer': 'shimmer 2s linear infinite',
  'price-update': 'priceUpdate 0.5s ease-out',
}
```

---

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Very large screens
}
```

### Layout Behavior

**Mobile (< 768px):**
- Single column layouts
- Bottom navigation
- Collapsible sections
- Full-width cards
- Stack all grids vertically
- Hide non-essential data

**Tablet (768px - 1024px):**
- 2-column grids
- Sidebar visible
- Compact density by default
- Show key metrics only

**Desktop (> 1024px):**
- 3-4 column grids
- Full sidebar + top bar
- Comfortable density
- Multi-panel layouts
- All data visible

### Responsive Patterns

**Grid Layouts:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

**Conditional Rendering:**
```tsx
<div className="hidden lg:flex">
  {/* Desktop-only content */}
</div>

<div className="lg:hidden">
  {/* Mobile-only content */}
</div>
```

**Adaptive Typography:**
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Portfolio
</h1>
```

---

## Accessibility

### WCAG AA Compliance

**Color Contrast:**
- Text ≥ 4.5:1 contrast ratio
- Large text ≥ 3:1 contrast ratio
- UI components ≥ 3:1 contrast ratio

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- Skip to main content link

**Screen Readers:**
- Semantic HTML (nav, main, aside, etc.)
- ARIA labels for icon-only buttons
- ARIA live regions for price updates
- Alt text for images and charts

### Accessibility Patterns

**Price Announcements:**
```tsx
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

**Table Keyboard Nav:**
- Arrow keys to navigate cells
- Home/End to jump to start/end
- Enter to select row

**Focus Management:**
- Trap focus in modals
- Return focus after modal close
- Skip navigation links

### Testing Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible and clear
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Screen reader announcements for price changes
- [ ] Alt text for all images and charts
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA labels for icon-only buttons
- [ ] Skip to main content link
- [ ] Form inputs have associated labels
- [ ] Error messages are descriptive and helpful

---

## Performance

### Performance Budget

```
Targets:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Bundle Size: < 300KB (gzipped)
- API Response: < 500ms
```

### Optimization Strategies

**Code Splitting:**
```tsx
// Route-based splitting (automatic with Next.js)
const Portfolio = dynamic(() => import('./Portfolio'))

// Component-based splitting
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

**Image Optimization:**
```tsx
import Image from 'next/image'

<Image
  src="/chart.png"
  width={800}
  height={400}
  loading="lazy"
  placeholder="blur"
/>
```

**Data Fetching:**
- Prefetch on hover
- Aggressive caching (React Query)
- Stale-while-revalidate
- Optimistic updates

**Bundle Optimization:**
- Tree-shaking
- Remove unused dependencies
- Use lightweight alternatives
- Analyze bundle with webpack-bundle-analyzer

### Loading States

**Progressive Loading:**
1. Show skeleton immediately (0ms)
2. Load critical data first (portfolio value)
3. Load secondary data (charts, news)
4. Use optimistic updates

**Example:**
```tsx
<Card>
  {isLoading ? (
    <Skeleton className="h-20" />
  ) : (
    <PortfolioValue value={data.value} />
  )}

  <Suspense fallback={<ChartSkeleton />}>
    <PortfolioChart />
  </Suspense>
</Card>
```

---

## Dark Mode

### Color Adjustments

**Principles:**
1. Reduce pure white - use #f5f5f5 for text
2. Increase border visibility slightly
3. Reduce shadow strength by 50%
4. Keep gain/loss colors bright (don't dim)
5. Use semi-transparent overlays for layering

**Background Hierarchy:**
```
Light Mode:
- Primary: #ffffff
- Secondary: #f9fafb
- Tertiary: #f3f4f6

Dark Mode:
- Primary: #0a0a0a
- Secondary: #171717
- Tertiary: #262626
```

### Implementation

```tsx
// Toggle implementation
<html className={isDarkMode ? 'dark' : ''}>
  {/* Tailwind's dark: variant handles the rest */}
</html>

// Component usage
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
  {/* Content */}
</div>
```

### Chart Colors in Dark Mode

- Increase line thickness slightly
- Use brighter colors (400 instead of 600)
- Reduce grid line opacity
- Lighten axis labels

---

## Number Formatting

### Utilities

```typescript
// Currency
formatCurrency(125432.50)
// → "$125,432.50"

formatCurrency(125432.50, { compact: true })
// → "$125.4K"

// Large numbers
formatLargeNumber(1500000000)
// → "$1.50B"

// Percentages
formatPercent(2.345)
// → "+2.35%"

formatPercent(-1.2, { decimals: 1, showSign: false })
// → "1.2%"

// Regular numbers
formatNumber(1234567)
// → "1,234,567"

formatNumber(1234567, true)
// → "1.23M"

// Relative time
formatRelativeTime(date)
// → "2h ago" or "3d ago" or "Nov 18, 2025"
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up Tailwind config with custom colors and typography
- [ ] Install and configure fonts (Inter, JetBrains Mono)
- [ ] Create base layout components (Sidebar, TopBar, MobileNav)
- [ ] Implement dark mode toggle and persistence
- [ ] Set up shadcn/ui components

### Phase 2: Core Components
- [ ] Build Card variants (default, elevated, bordered)
- [ ] Create PriceChange component with animations
- [ ] Build Badge component with financial variants
- [ ] Implement DataTable with sorting and keyboard nav
- [ ] Create MetricCard for KPIs
- [ ] Build loading states (Skeleton, Shimmer)

### Phase 3: Screen Layouts
- [ ] Dashboard screen (grid layout, responsive)
- [ ] Portfolio screen (detailed table, charts)
- [ ] Screener screen (sidebar filters, results table)
- [ ] Stock detail page (tabs, comprehensive data)
- [ ] Macro dashboard (indicator cards, charts)

### Phase 4: Polish
- [ ] Add micro-interactions (hover states, transitions)
- [ ] Implement price flash animations
- [ ] Add empty states for all screens
- [ ] Create error states with retry actions
- [ ] Add tooltips with rich data
- [ ] Implement keyboard shortcuts (Cmd+K for search)
- [ ] Ensure WCAG AA accessibility compliance

### Phase 5: Testing
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test dark mode across all screens
- [ ] Test with screen readers
- [ ] Test keyboard navigation
- [ ] Performance testing (Lighthouse score > 90)

---

## Design Principles

### 1. Clarity Over Decoration
- Financial data must be immediately scannable
- Remove unnecessary visual elements
- Use whitespace generously
- Hierarchy through typography and spacing, not color

### 2. Consistent Color Language
- Green = Positive/Gain (NEVER for "go" or "yes")
- Red = Negative/Loss (NEVER for "stop" or "no")
- Blue = Neutral/Information
- Gray = Secondary/Inactive

### 3. Real-time Feedback
- Price changes trigger subtle animations
- Flash effects for significant moves
- Loading states for every async operation
- Optimistic UI updates where appropriate

### 4. Progressive Disclosure
- Show summary first, details on demand
- Reduce cognitive load
- Maintain context
- Quick access to deep information

### 5. Accessibility First
- Keyboard navigation for all interactions
- Screen reader support
- High contrast compliance
- Focus management

---

## Resources

### Design Tools
- Figma (for mockups)
- Tailwind CSS (styling)
- shadcn/ui (component primitives)
- Lucide React (icons)
- Radix UI (accessible primitives)

### Reference Designs
- Bloomberg Terminal (inspiration)
- Robinhood (modern fintech)
- TradingView (charts)
- Yahoo Finance (data density)

### Color Tools
- Coolors.co (palette generation)
- Contrast Checker (WCAG compliance)
- Tailwind Color Generator

### Font Resources
- Google Fonts (Inter)
- JetBrains Mono (monospace)

---

## Changelog

### Version 1.0 (November 18, 2025)
- Initial design system documentation
- Complete color palette
- Typography scale
- Component library specifications
- Screen layouts
- UX patterns
- Accessibility guidelines
- Performance requirements

---

**End of Design System Documentation**

For questions or updates, refer to this living document. Update as the design evolves.
