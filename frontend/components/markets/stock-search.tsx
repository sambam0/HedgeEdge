'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useStockSearch } from '@/lib/hooks/useMarket';

interface StockSearchProps {
  onSelectStock: (ticker: string) => void;
}

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data, isLoading } = useStockSearch(query);

  const results = data?.results || [];

  const handleSelect = (ticker: string) => {
    onSelectStock(ticker);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search stocks..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {showResults && query && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleSelect(stock.ticker)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-700 border-b border-gray-100 dark:border-neutral-700 last:border-b-0"
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {stock.ticker}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stock.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query && isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Searching...
          </div>
        </div>
      )}
    </div>
  );
}
