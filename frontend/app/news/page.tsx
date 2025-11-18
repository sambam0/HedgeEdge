'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial News</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Latest market news and analysis
          </p>
        </div>

        {/* Sentiment Gauge */}
        <SentimentGauge />

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-900 rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search news (e.g., 'Apple earnings', 'TSLA', 'Federal Reserve')..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>

        {/* News Feed */}
        <NewsFeed query={searchQuery} onTickerClick={handleTickerClick} />
      </div>
    </div>
  );
}
