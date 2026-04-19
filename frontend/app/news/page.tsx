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
              type="button"
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
