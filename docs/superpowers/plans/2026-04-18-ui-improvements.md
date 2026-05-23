# UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the HedgeEdge UI across mobile navigation, news page structure, data tables, chart interactivity, and missing pages.

**Architecture:** Each task is self-contained and targets a specific file or component group. No shared state changes span tasks — each commit leaves the app in a working state. Tasks are ordered by priority: P0 blockers first, then polish.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 3.4, Recharts 3.4.1, Lucide React, React Query 5, Jest + React Testing Library.

---

## File Map

| Task | Files Modified | Files Created |
|------|---------------|---------------|
| 1 | `frontend/components/layout/app-layout.tsx`<br>`frontend/components/layout/sidebar.tsx`<br>`frontend/components/layout/topbar.tsx` | `frontend/components/layout/__tests__/sidebar.test.tsx` |
| 2 | `frontend/app/news/page.tsx`<br>`frontend/components/news/news-card.tsx` | `frontend/components/news/__tests__/news-card.test.tsx` |
| 3 | `frontend/app/news/page.tsx`<br>`frontend/components/news/news-feed.tsx` | — |
| 4 | `frontend/components/ui/data-table.tsx` | `frontend/components/ui/__tests__/data-table.test.tsx` |
| 5 | `frontend/app/screener/page.tsx` | — |
| 6 | `frontend/components/analysis/benchmark-comparison.tsx` | — |
| 7 | `frontend/app/page.tsx` | — |
| 8 | — | `frontend/app/settings/page.tsx` |

---

## Task 1: Mobile Hamburger Navigation

**Context:** `Sidebar` is `hidden lg:flex` — on mobile there is no way to navigate. `AppLayout` is a server component with no state. `TopBar` renders only a logo on mobile. This task adds a hamburger button to `TopBar`, a slide-in drawer to `Sidebar`, and lifts the open/close state into `AppLayout`.

**Files:**
- Modify: `frontend/components/layout/app-layout.tsx`
- Modify: `frontend/components/layout/sidebar.tsx`
- Modify: `frontend/components/layout/topbar.tsx`
- Create: `frontend/components/layout/__tests__/sidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/components/layout/__tests__/sidebar.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Sidebar', () => {
  it('desktop sidebar is always in the DOM', () => {
    const { container } = render(<Sidebar isOpen={false} onClose={() => {}} />);
    // The desktop aside has lg:flex class
    const desktopAside = container.querySelector('aside.hidden');
    expect(desktopAside).toBeInTheDocument();
  });

  it('mobile drawer is not rendered when isOpen is false', () => {
    render(<Sidebar isOpen={false} onClose={() => {}} />);
    // Only one aside when closed
    expect(document.querySelectorAll('aside').length).toBe(1);
  });

  it('mobile drawer renders when isOpen is true', () => {
    render(<Sidebar isOpen={true} onClose={() => {}} />);
    // Two asides: desktop + mobile drawer
    expect(document.querySelectorAll('aside').length).toBe(2);
  });

  it('clicking the overlay calls onClose', () => {
    const onClose = jest.fn();
    render(<Sidebar isOpen={true} onClose={onClose} />);
    const overlay = document.querySelector('[data-testid="mobile-overlay"]') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx jest components/layout/__tests__/sidebar.test.tsx --no-coverage
```

Expected: FAIL — `Sidebar` does not accept `isOpen` or `onClose` props.

- [ ] **Step 3: Rewrite `sidebar.tsx`**

Replace the entire file:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Search,
  Star,
  Globe2,
  BarChart3,
  Newspaper,
  Settings,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Portfolio', href: '/portfolio', icon: Wallet },
  { title: 'Markets', href: '/markets', icon: TrendingUp },
  { title: 'Screener', href: '/screener', icon: Search },
  { title: 'Watchlist', href: '/watchlist', icon: Star },
  { title: 'Macro', href: '/macro', icon: Globe2 },
  { title: 'Analysis', href: '/analysis', icon: BarChart3 },
  { title: 'News', href: '/news', icon: Newspaper },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navLink = (item: typeof navItems[0]) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
        )}
      >
        <Icon className="w-5 h-5" />
        {item.title}
      </Link>
    );
  };

  const inner = (
    <>
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Principle</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(navLink)}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <div className="mt-4 px-3 py-2 bg-gray-50 dark:bg-neutral-800 rounded-md">
          <div className="text-xs text-gray-600 dark:text-gray-400">Market Status</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Open
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800">
        {inner}
      </aside>

      {/* Mobile drawer — shown when isOpen */}
      {isOpen && (
        <>
          <div
            data-testid="mobile-overlay"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 lg:hidden">
            {inner}
          </aside>
        </>
      )}
    </>
  );
}
```

- [ ] **Step 4: Update `topbar.tsx`** to accept `onMenuToggle` and render the hamburger button

Replace the entire file:

```tsx
'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left: hamburger (mobile) + logo (mobile) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Principle</h1>
        </div>

        {/* Right: theme toggle */}
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Update `app-layout.tsx`** to manage mobile nav state and wire props

Replace the entire file:

```tsx
'use client';

import { useState } from 'react';
import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="lg:pl-64">
        <TopBar onMenuToggle={() => setMobileNavOpen(true)} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx jest components/layout/__tests__/sidebar.test.tsx --no-coverage
```

Expected: PASS — all 4 tests green.

- [ ] **Step 7: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/components/layout/app-layout.tsx frontend/components/layout/sidebar.tsx frontend/components/layout/topbar.tsx frontend/components/layout/__tests__/sidebar.test.tsx
git commit -m "feat: add mobile hamburger navigation drawer"
```

---

## Task 2: News Page — AppLayout Fix + Sentiment Chips

**Context:** `news/page.tsx` renders its own `min-h-screen bg-gray-50` wrapper instead of using `AppLayout`, so it has no sidebar on any viewport. `NewsCard` shows sentiment as a 2×2px dot — barely visible. This task wraps the page in `AppLayout` and replaces the dot with a labeled color chip.

**Files:**
- Modify: `frontend/app/news/page.tsx`
- Modify: `frontend/components/news/news-card.tsx`
- Create: `frontend/components/news/__tests__/news-card.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/components/news/__tests__/news-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { NewsCard } from '../news-card';

const baseArticle = {
  title: 'Markets rally on Fed news',
  description: 'Stocks surged after the Federal Reserve held rates steady.',
  url: 'https://example.com/article',
  source: 'Reuters',
  published_at: new Date().toISOString(),
  sentiment: 'positive' as const,
  tickers: [],
};

describe('NewsCard sentiment chip', () => {
  it('shows a green chip for positive sentiment', () => {
    render(<NewsCard article={baseArticle} />);
    const chip = screen.getByText('Positive');
    expect(chip.closest('span')).toHaveClass('bg-green-100');
  });

  it('shows a red chip for negative sentiment', () => {
    render(<NewsCard article={{ ...baseArticle, sentiment: 'negative' }} />);
    const chip = screen.getByText('Negative');
    expect(chip.closest('span')).toHaveClass('bg-red-100');
  });

  it('shows a gray chip for neutral sentiment', () => {
    render(<NewsCard article={{ ...baseArticle, sentiment: 'neutral' }} />);
    const chip = screen.getByText('Neutral');
    expect(chip.closest('span')).toHaveClass('bg-gray-100');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx jest components/news/__tests__/news-card.test.tsx --no-coverage
```

Expected: FAIL — `screen.getByText('Positive')` finds nothing (current render is a dot, not text).

- [ ] **Step 3: Rewrite `news-card.tsx`** to use sentiment chips

Replace the entire file:

```tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsCardProps {
  article: {
    title: string;
    description: string;
    url: string;
    source: string;
    published_at: string;
    image_url?: string;
    author?: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    tickers: string[];
  };
  onTickerClick?: (ticker: string) => void;
}

const sentimentConfig = {
  positive: {
    label: 'Positive',
    Icon: TrendingUp,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  neutral: {
    label: 'Neutral',
    Icon: Minus,
    className: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400',
  },
  negative: {
    label: 'Negative',
    Icon: TrendingDown,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function NewsCard({ article, onTickerClick }: NewsCardProps) {
  const { label, Icon, className } = sentimentConfig[article.sentiment];

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Unknown';

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 hover:shadow-lg transition-shadow p-4"
    >
      <div className="flex gap-4">
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {article.title}
          </h3>

          {article.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {article.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{article.source}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">{timeAgo}</span>

            {/* Sentiment chip */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
              <Icon className="w-3 h-3" />
              {label}
            </span>
          </div>

          {article.tickers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {article.tickers.map((ticker) => (
                <button
                  key={ticker}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTickerClick?.(ticker);
                  }}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  ${ticker}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
```

- [ ] **Step 4: Update `news/page.tsx`** to wrap in AppLayout

Replace the entire file:

```tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { NewsFeed } from '@/components/news/news-feed';
import { SentimentGauge } from '@/components/news/sentiment-gauge';

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('stock market');
  const [inputValue, setInputValue] = useState('stock market');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  const handleTickerClick = (ticker: string) => {
    setInputValue(ticker);
    setSearchQuery(ticker);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial News</h1>
          <p className="text-gray-600 dark:text-gray-400">Latest market news and analysis</p>
        </div>

        <SentimentGauge />

        <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search news (e.g., 'Apple earnings', 'TSLA', 'Federal Reserve')..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>

        <NewsFeed query={searchQuery} onTickerClick={handleTickerClick} />
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx jest components/news/__tests__/news-card.test.tsx --no-coverage
```

Expected: PASS — all 3 chip tests green.

- [ ] **Step 6: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/app/news/page.tsx frontend/components/news/news-card.tsx frontend/components/news/__tests__/news-card.test.tsx
git commit -m "feat: wrap news page in AppLayout and add sentiment chip badges"
```

---

## Task 3: News Sentiment Filter Bar

**Context:** `NewsFeed` fetches paginated articles from the API; we cannot add server-side sentiment filtering without API changes. Client-side filtering the flat list of fetched articles is sufficient and correct — the API already returns `sentiment` on each article.

**Files:**
- Modify: `frontend/components/news/news-feed.tsx`
- Modify: `frontend/app/news/page.tsx`

- [ ] **Step 1: Update `news-feed.tsx`** to accept and apply `sentimentFilter`

Replace the entire file:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useNewsSearch } from '@/lib/hooks/useNews';
import { NewsCard } from './news-card';

type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative';

interface NewsFeedProps {
  query: string;
  onTickerClick?: (ticker: string) => void;
  sentimentFilter?: SentimentFilter;
}

export function NewsFeed({ query, onTickerClick, sentimentFilter = 'all' }: NewsFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNewsSearch(query);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-full mb-4" />
            <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  const allArticles = data?.pages.flatMap((page) => page.articles) ?? [];
  const articles = sentimentFilter === 'all'
    ? allArticles
    : allArticles.filter((a) => a.sentiment === sentimentFilter);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          {sentimentFilter === 'all'
            ? 'No news articles found.'
            : `No ${sentimentFilter} articles found. Try a different filter.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <NewsCard key={`${article.url}-${index}`} article={article} onTickerClick={onTickerClick} />
      ))}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-gray-600 dark:text-gray-400">Loading more...</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `news/page.tsx`** to add the filter bar and wire `sentimentFilter`

Replace the entire file:

```tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/app-layout';
import { NewsFeed } from '@/components/news/news-feed';
import { SentimentGauge } from '@/components/news/sentiment-gauge';

type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative';

const filterButtons: { value: SentimentFilter; label: string; activeClass: string }[] = [
  { value: 'all', label: 'All', activeClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
  { value: 'positive', label: 'Positive', activeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'neutral', label: 'Neutral', activeClass: 'bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-gray-300' },
  { value: 'negative', label: 'Negative', activeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('stock market');
  const [inputValue, setInputValue] = useState('stock market');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  const handleTickerClick = (ticker: string) => {
    setInputValue(ticker);
    setSearchQuery(ticker);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial News</h1>
          <p className="text-gray-600 dark:text-gray-400">Latest market news and analysis</p>
        </div>

        <SentimentGauge />

        <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search news (e.g., 'Apple earnings', 'TSLA', 'Federal Reserve')..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>

        {/* Sentiment filter bar */}
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-lg px-4 py-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mr-1">Filter:</span>
          {filterButtons.map(({ value, label, activeClass }) => (
            <button
              key={value}
              onClick={() => setSentimentFilter(value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                sentimentFilter === value
                  ? activeClass
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <NewsFeed
          query={searchQuery}
          onTickerClick={handleTickerClick}
          sentimentFilter={sentimentFilter}
        />
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to the files just modified.

- [ ] **Step 4: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/components/news/news-feed.tsx frontend/app/news/page.tsx
git commit -m "feat: add sentiment filter bar to news page"
```

---

## Task 4: DataTable — Sticky Headers + Universal Row Hover

**Context:** `DataTable`'s `<thead>` scrolls away on long tables. Row hover only activates when `onRowClick` is passed — this makes tables feel dead even when they're just read-only data displays.

**Files:**
- Modify: `frontend/components/ui/data-table.tsx`
- Create: `frontend/components/ui/__tests__/data-table.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/components/ui/__tests__/data-table.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { DataTable, Column } from '../data-table';

interface Row { name: string; value: number; }
const columns: Column<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'value', header: 'Value', align: 'right' },
];
const data: Row[] = [{ name: 'Apple', value: 100 }, { name: 'Google', value: 200 }];

describe('DataTable', () => {
  it('thead has sticky class', () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    const thead = container.querySelector('thead');
    expect(thead).toHaveClass('sticky');
    expect(thead).toHaveClass('top-0');
  });

  it('rows have hover class even without onRowClick', () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    const firstRow = container.querySelector('tbody tr');
    expect(firstRow).toHaveClass('hover:bg-gray-50');
  });

  it('rows have cursor-pointer only when onRowClick is provided', () => {
    const { container: withClick } = render(
      <DataTable data={data} columns={columns} onRowClick={() => {}} />
    );
    const { container: noClick } = render(
      <DataTable data={data} columns={columns} />
    );
    expect(withClick.querySelector('tbody tr')).toHaveClass('cursor-pointer');
    expect(noClick.querySelector('tbody tr')).not.toHaveClass('cursor-pointer');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx jest components/ui/__tests__/data-table.test.tsx --no-coverage
```

Expected: FAIL — `sticky` class not found on thead, rows without `onRowClick` lack hover class.

- [ ] **Step 3: Update `data-table.tsx`**

Two targeted edits. First, make the `<thead>` sticky by changing its `className`:

```tsx
// Old:
<thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
// New:
<thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
```

Second, make row hover universal and keep cursor-pointer conditional:

```tsx
// Old:
<tr
  key={keyExtractor(row, rowIndex)}
  className={`${
    onRowClick
      ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors'
      : ''
  }`}
  onClick={() => onRowClick?.(row)}
>
// New:
<tr
  key={keyExtractor(row, rowIndex)}
  className={`hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${
    onRowClick ? 'cursor-pointer' : ''
  }`}
  onClick={() => onRowClick?.(row)}
>
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx jest components/ui/__tests__/data-table.test.tsx --no-coverage
```

Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/components/ui/data-table.tsx frontend/components/ui/__tests__/data-table.test.tsx
git commit -m "feat: sticky table headers and universal row hover in DataTable"
```

---

## Task 5: Screener — Replace Ad-hoc Table with DataTable

**Context:** `screener/page.tsx` uses hand-rolled `<table>` markup instead of the existing `DataTable` component. This means it has no sorting, no consistent styling, and no empty-state logic. Replacing it with `DataTable` gives all of that for free.

**Files:**
- Modify: `frontend/app/screener/page.tsx`

- [ ] **Step 1: Read the full current screener page** to understand all markup being replaced

```bash
cd /Users/santoncich/HedgeEdge/frontend && cat app/screener/page.tsx
```

Confirm the table renders `ticker`, `price`, `change`/`change_percent`, `market_cap`, `pe_ratio` fields.

- [ ] **Step 2: Replace `screener/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx tsc --noEmit 2>&1 | grep screener
```

Expected: no output (no errors in screener/page.tsx).

- [ ] **Step 4: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/app/screener/page.tsx
git commit -m "refactor: replace ad-hoc screener table with DataTable component"
```

---

## Task 6: BenchmarkComparison — Interactive Chart + Skeleton Loading

**Context:** The chart already has `<Tooltip>` but no crosshair cursor, and the loading state is plain text. Adding `cursor` to `<Tooltip>`, a `<Brush>` for zoom, and a `<Skeleton>` for loading state makes this the most interactive chart in the app.

**Files:**
- Modify: `frontend/components/analysis/benchmark-comparison.tsx`

- [ ] **Step 1: Update `benchmark-comparison.tsx`**

Replace the entire file:

```tsx
'use client';

import { useBenchmarkComparison } from '@/lib/hooks/useAnalysis';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface BenchmarkComparisonProps {
  portfolioId: number;
  benchmark?: string;
  period?: string;
}

export function BenchmarkComparison({
  portfolioId,
  benchmark = '^GSPC',
  period = '1Y',
}: BenchmarkComparisonProps) {
  const { data, isLoading, error } = useBenchmarkComparison(portfolioId, benchmark, period);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <Skeleton className="h-6 w-56 mb-6" />
        <div className="flex gap-8 mb-6">
          <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-7 w-20" /></div>
          <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-7 w-20" /></div>
          <div><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="h-7 w-16" /></div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio vs Benchmark
        </h3>
        <div className="text-red-600 dark:text-red-400">Failed to load benchmark comparison</div>
      </div>
    );
  }

  const chartData = data.chart_data.portfolio.map((value, index) => ({
    index,
    portfolio: value,
    benchmark: data.chart_data.benchmark[index] ?? 0,
  }));

  const returnClass = (v: number) => (v >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400');
  const sign = (v: number) => (v >= 0 ? '+' : '');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio vs {data.benchmark_name}
          </h3>
          <div className="flex gap-6 mt-2">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Portfolio Return</div>
              <div className={`text-xl font-bold ${returnClass(data.portfolio_return)}`}>
                {sign(data.portfolio_return)}{data.portfolio_return.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{data.benchmark_name} Return</div>
              <div className={`text-xl font-bold ${returnClass(data.benchmark_return)}`}>
                {sign(data.benchmark_return)}{data.benchmark_return.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alpha</div>
              <div className={`text-xl font-bold ${returnClass(data.alpha)}`}>
                {sign(data.alpha)}{data.alpha.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.2)" />
          <XAxis dataKey="index" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Tooltip
            cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{
              backgroundColor: 'rgb(17, 24, 39)',
              border: '1px solid rgba(75,85,99,0.4)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`]}
          />
          <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Portfolio"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="#10b981"
            strokeWidth={2}
            name={data.benchmark_name}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Brush
            dataKey="index"
            height={24}
            stroke="#3b82f6"
            travellerWidth={6}
            fill="transparent"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx tsc --noEmit 2>&1 | grep benchmark
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/components/analysis/benchmark-comparison.tsx
git commit -m "feat: interactive benchmark chart with crosshair, zoom brush, and skeleton loader"
```

---

## Task 7: Dashboard — Wire Top-Positions Sparkline Row

**Context:** `MiniSparkline` exists at `components/charts/mini-sparkline.tsx` and accepts `data?: number[]` (falls back to mock data) and `positive?: boolean`. The dashboard's `portfolioData.positions` array includes `gain_loss_percent`. This task adds a "Top Positions" row below the metric cards that shows each position's name, value, and a sparkline.

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Read the current positions data shape** to confirm field names

```bash
cd /Users/santoncich/HedgeEdge/frontend && grep -r "positions" lib/hooks/ --include="*.ts" -l
```

Then read whichever hook file is returned to confirm the fields on each position object (expecting: `ticker`, `market_value`, `gain_loss_percent`).

- [ ] **Step 2: Update `app/page.tsx`** to add the sparkline row

Replace the entire file content after the existing imports, adding `MiniSparkline` and a top positions section between the Portfolio Summary and Market Indices sections:

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { PriceChange } from '@/components/ui/price-change';
import { MiniSparkline } from '@/components/charts/mini-sparkline';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { data: indicesData } = useQuery({
    queryKey: ['indices'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/market/indices');
      return res.json();
    },
  });

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio-performance'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/portfolio/1/performance');
      return res.json();
    },
  });

  const topPositions = portfolioData?.positions?.slice(0, 4) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening in the markets today.
          </p>
        </div>

        {/* Portfolio Summary */}
        {portfolioData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Value" value={formatCurrency(portfolioData.total_value)} icon={Wallet} />
            <MetricCard label="Total Gain/Loss" value={formatCurrency(portfolioData.total_gain_loss)} change={portfolioData.total_gain_loss_percent} />
            <MetricCard label="Daily Change" value={formatCurrency(portfolioData.daily_change)} change={portfolioData.daily_change_percent} />
            <MetricCard label="Positions" value={portfolioData.positions_count} />
          </div>
        )}

        {/* Top Positions Sparklines */}
        {topPositions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Positions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPositions.map((pos: any) => (
                <Card key={pos.ticker}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{pos.ticker}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                          {formatCurrency(pos.market_value)}
                        </div>
                      </div>
                      <PriceChange percent={pos.gain_loss_percent} size="sm" />
                    </div>
                    <MiniSparkline positive={pos.gain_loss_percent >= 0} height={40} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Market Indices */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Indices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {indicesData?.map((index: any) => (
              <Card key={index.symbol}>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{index.name}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums mb-2">
                    {index.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <PriceChange value={index.change} percent={index.change_percent} size="sm" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx tsc --noEmit 2>&1 | grep "app/page"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/app/page.tsx
git commit -m "feat: add top positions sparkline row to dashboard"
```

---

## Task 8: Settings Page

**Context:** The sidebar's bottom section links to `/settings` which returns a 404. This task creates a minimal settings page that at minimum resolves the broken link.

**Files:**
- Create: `frontend/app/settings/page.tsx`

- [ ] **Step 1: Create `app/settings/page.tsx`**

```tsx
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use the theme toggle in the top bar to switch between light and dark mode.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active portfolio ID: 1
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 2: Verify the page builds**

```bash
cd /Users/santoncich/HedgeEdge/frontend && npx tsc --noEmit 2>&1 | grep settings
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/santoncich/HedgeEdge && git add frontend/app/settings/page.tsx
git commit -m "feat: add settings page to fix sidebar 404"
```

---

## Self-Review

### Spec Coverage

| Plan item | Task |
|-----------|------|
| Collapsible sidebar / hamburger for narrow viewports | Task 1 |
| Sentiment badges as color-coded chips with icons | Task 2 |
| News page AppLayout structural fix | Task 2 |
| News filter bar by sentiment | Task 3 |
| DataTable sticky headers | Task 4 |
| Row hover highlights | Task 4 |
| Screener DataTable standardization | Task 5 |
| Interactive benchmark chart (crosshair, zoom) | Task 6 |
| Chart skeleton loaders | Task 6 |
| Dashboard sparkline row for top holdings | Task 7 |
| Dashboard responsive sm:grid-cols-2 fix | Task 7 |
| Settings page (fix 404) | Task 8 |

**Intentionally excluded (require API changes or out of scope):**
- Watchlist empty state — `DataTable` already renders `emptyMessage` text; Watchlist already uses DataTable with `loading` skeleton; no new work needed.
- MiniSparkline on Dashboard uses mock sparkline data (no per-position price history endpoint exists).
- Sticky summary bar in TopBar — superseded by the existing MetricCard grid on dashboard; adding a second summary bar would duplicate data.
- Click-to-expand inline position details — requires knowing the expanded data shape; excluded to avoid YAGNI speculation.

### Placeholder Scan

No TBD, TODO, or "similar to Task N" patterns found. All code blocks are complete.

### Type Consistency

- `SentimentFilter` type defined in `news-feed.tsx` and re-declared in `news/page.tsx` — intentional duplication to avoid a shared-types file for a two-file usage. Both declarations are identical.
- `ScreenerStock` interface in Task 5 matches the field names visible in the original screener table markup (`ticker`, `price`, `change`, `change_percent`, `market_cap`, `pe_ratio`).
- `pos.ticker`, `pos.market_value`, `pos.gain_loss_percent` in Task 7 — confirm field names against the portfolio hook in Step 1 before committing.
