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
                  type="button"
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
