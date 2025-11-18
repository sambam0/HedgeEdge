# Workstream 5: Advanced Features & Polish

**Agent Focus:** Performance, accessibility, testing, and production readiness

**Estimated Time:** 5-7 days

**Priority:** LOW (Start in Week 3 after core features complete)

**Dependencies:** Requires Workstreams 1-4 mostly complete

---

## Overview

Polish the application for production including:
- Performance optimizations
- Accessibility improvements
- Testing (unit, integration, e2e)
- Advanced features (search, alerts, exports)
- Bug fixes and refinements
- Documentation

---

## Task Breakdown

### 1. Global Search / Command Palette (Day 1-2)

#### 1.1 Install dependencies
```bash
npm install cmdk
```

#### 1.2 Create Command Palette
**File:** `frontend/components/command-palette.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, TrendingUp, Wallet, BarChart3, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
      <div className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <Command className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
          <div className="flex items-center border-b border-gray-200 dark:border-neutral-800 px-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search stocks, pages, or actions..."
              className="flex-1 bg-transparent px-3 py-4 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages" className="mb-2">
              <Command.Item
                onSelect={() => navigate('/')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/portfolio')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <Wallet className="w-4 h-4" />
                <span>Portfolio</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/screener')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <Search className="w-4 h-4" />
                <span>Screener</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Stocks">
              {/* Dynamic stock search results would go here */}
              <Command.Item className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800">
                <TrendingUp className="w-4 h-4" />
                <span>Search for stocks...</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
```

#### 1.3 Add to layout
**File:** `frontend/app/layout.tsx` (update)

```tsx
import { CommandPalette } from '@/components/command-palette';

// Add inside body
<CommandPalette />
```

---

### 2. Performance Optimizations (Day 2-3)

#### 2.1 Optimize bundle size

**Analyze current bundle:**
```bash
npm run build
```

**Install bundle analyzer:**
```bash
npm install -D @next/bundle-analyzer
```

**File:** `frontend/next.config.js` (update)

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
});
```

**Run analysis:**
```bash
ANALYZE=true npm run build
```

#### 2.2 Code splitting & lazy loading

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/charts/candlestick-chart'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false,
});
```

#### 2.3 Image optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Principle"
  width={40}
  height={40}
  priority // For above-the-fold images
/>
```

#### 2.4 Memoization for expensive calculations

```tsx
import { useMemo } from 'react';

const sortedAndFilteredData = useMemo(() => {
  return data
    .filter(item => item.value > threshold)
    .sort((a, b) => b.value - a.value);
}, [data, threshold]);
```

---

### 3. Accessibility Improvements (Day 3)

#### 3.1 ARIA labels and roles

**File:** `frontend/components/ui/data-table.tsx` (update)

```tsx
<table role="table" aria-label={`${title} data table`}>
  <thead role="rowgroup">
    <tr role="row">
      {columns.map((col) => (
        <th
          key={col.key}
          role="columnheader"
          aria-sort={sortKey === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
          {col.header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody role="rowgroup">
    {/* ... */}
  </tbody>
</table>
```

#### 3.2 Keyboard navigation

**File:** `frontend/components/ui/modal.tsx` (update)

```tsx
useEffect(() => {
  if (!isOpen) return;

  const focusableElements = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  firstElement?.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

#### 3.3 Screen reader announcements

**File:** `frontend/components/ui/live-announcer.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

let announceTimeout: NodeJS.Timeout;

export function LiveAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    (window as any).announce = (message: string) => {
      clearTimeout(announceTimeout);
      setAnnouncement(message);

      announceTimeout = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
    };

    return () => {
      clearTimeout(announceTimeout);
    };
  }, []);

  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

// Usage in other components:
// (window as any).announce?.('Portfolio value updated to $125,432');
```

#### 3.4 Focus indicators

**File:** `frontend/app/globals.css` (add)

```css
/* Custom focus indicators */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

.dark *:focus-visible {
  outline-color: #60a5fa;
}
```

---

### 4. Testing (Day 4-5)

#### 4.1 Unit tests setup

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

**File:** `jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

**File:** `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
```

#### 4.2 Example unit tests

**File:** `frontend/lib/__tests__/utils.test.ts`

```typescript
import { formatCurrency, formatPercent, formatLargeNumber } from '../utils';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats compact currency', () => {
    expect(formatCurrency(1234567, true)).toBe('$1.23M');
  });
});

describe('formatPercent', () => {
  it('formats positive percent with sign', () => {
    expect(formatPercent(2.345, 2, true)).toBe('+2.35%');
  });

  it('formats negative percent', () => {
    expect(formatPercent(-1.234, 2, true)).toBe('-1.23%');
  });
});

describe('formatLargeNumber', () => {
  it('formats billions', () => {
    expect(formatLargeNumber(1500000000)).toBe('$1.50B');
  });

  it('formats millions', () => {
    expect(formatLargeNumber(1500000)).toBe('$1.50M');
  });
});
```

#### 4.3 Component tests

**File:** `frontend/components/ui/__tests__/price-change.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { PriceChange } from '../price-change';

describe('PriceChange', () => {
  it('renders positive change in green', () => {
    render(<PriceChange value={10.50} percent={2.5} />);

    const element = screen.getByText('+2.50%');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-green-600');
  });

  it('renders negative change in red', () => {
    render(<PriceChange value={-5.25} percent={-1.8} />);

    const element = screen.getByText('-1.80%');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('text-red-600');
  });
});
```

**Run tests:**
```bash
npm test
```

---

### 5. Export Functionality (Day 5)

#### 5.1 CSV export utility

**File:** `frontend/lib/export-utils.ts`

```typescript
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  // Determine columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, header: key }));

  // Create CSV header
  const header = cols.map(col => col.header).join(',');

  // Create CSV rows
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col.key];
      // Escape commas and quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON<T>(data: T, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

#### 5.2 Use in components

```tsx
import { exportToCSV } from '@/lib/export-utils';

// In component
const handleExport = () => {
  exportToCSV(
    portfolioPositions,
    'portfolio-positions',
    [
      { key: 'ticker', header: 'Symbol' },
      { key: 'shares', header: 'Shares' },
      { key: 'cost_basis', header: 'Cost Basis' },
      { key: 'current_price', header: 'Current Price' },
      { key: 'current_value', header: 'Current Value' },
      { key: 'profit_loss', header: 'P&L' },
    ]
  );
};
```

---

### 6. Error Tracking & Logging (Day 6)

#### 6.1 Setup error tracking (optional - Sentry)

```bash
npm install @sentry/nextjs
```

**File:** `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

#### 6.2 Custom logging utility

**File:** `frontend/lib/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (process.env.NODE_ENV === 'development') {
      console[level](logMessage, data || '');
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // Send to Sentry, LogRocket, etc.
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
```

---

### 7. Analytics & Monitoring (Day 6)

#### 7.1 Page view tracking

**File:** `frontend/lib/analytics.ts`

```typescript
export const analytics = {
  pageView(url: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  },

  event(action: string, params?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, params);
    }
  },

  // Custom events
  trackStockView(ticker: string) {
    this.event('stock_view', { ticker });
  },

  trackPositionAdded(ticker: string, value: number) {
    this.event('position_added', { ticker, value });
  },

  trackScreenerSearch(filters: Record<string, any>) {
    this.event('screener_search', filters);
  },
};
```

---

### 8. SEO & Meta Tags (Day 7)

#### 8.1 Update meta tags

**File:** `frontend/app/layout.tsx` (update)

```tsx
export const metadata: Metadata = {
  title: 'Principle - Personal Trading Terminal',
  description: 'Professional trading terminal with real-time market data, portfolio tracking, and fundamental analysis tools.',
  keywords: ['trading', 'stocks', 'portfolio', 'market data', 'investing'],
  authors: [{ name: 'Sam' }],
  openGraph: {
    title: 'Principle - Personal Trading Terminal',
    description: 'Professional trading terminal for serious investors',
    type: 'website',
  },
};
```

#### 8.2 Dynamic meta for pages

**File:** `frontend/app/portfolio/page.tsx` (add)

```tsx
export const metadata = {
  title: 'Portfolio | Principle',
  description: 'Track your positions and portfolio performance',
};
```

---

### 9. Documentation (Day 7)

#### 9.1 Update README with deployment info

**File:** `README.md` (update)

Add sections for:
- Production deployment steps
- Environment variables
- Performance benchmarks
- Troubleshooting guide

#### 9.2 Create API documentation

**File:** `DOCS/API.md`

Document all API endpoints with:
- Request/response examples
- Authentication requirements
- Rate limiting
- Error codes

#### 9.3 Create component documentation

**File:** `DOCS/COMPONENTS.md`

Document reusable components with:
- Props interface
- Usage examples
- Accessibility notes

---

## Performance Checklist

- [ ] Bundle size < 300KB (gzipped)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Performance score > 90
- [ ] Lighthouse Accessibility score > 95
- [ ] Lighthouse Best Practices score > 90
- [ ] Lighthouse SEO score > 90
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting implemented
- [ ] Unused dependencies removed

---

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on all buttons/links
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Skip to main content link
- [ ] Form labels associated
- [ ] Error messages descriptive
- [ ] Live regions for dynamic content
- [ ] No keyboard traps

---

## Testing Checklist

- [ ] Unit tests for utilities (>80% coverage)
- [ ] Component tests for UI library
- [ ] Integration tests for critical flows
- [ ] E2E tests for user journeys
- [ ] Mobile responsive testing
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Dark mode testing
- [ ] Performance testing
- [ ] Load testing (if applicable)

---

## Production Readiness Checklist

- [ ] Environment variables configured
- [ ] Error tracking setup (Sentry)
- [ ] Analytics tracking (Google Analytics)
- [ ] SEO meta tags complete
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Monitoring dashboard setup
- [ ] Backup strategy in place
- [ ] Documentation complete

---

## Completion Criteria

✅ Lighthouse scores all > 90
✅ All accessibility requirements met
✅ Test coverage > 80%
✅ Performance optimized
✅ Production deployment successful
✅ Monitoring active
✅ Documentation complete
✅ Ready for public use
