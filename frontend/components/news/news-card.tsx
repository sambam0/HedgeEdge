'use client';

import { formatDistanceToNow } from 'date-fns';

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

export function NewsCard({ article, onTickerClick }: NewsCardProps) {
  const sentimentColors = {
    positive: 'bg-green-500',
    neutral: 'bg-yellow-500',
    negative: 'bg-red-500',
  };

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
        {/* Image */}
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {article.title}
          </h3>

          {/* Description */}
          {article.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {article.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{article.source}</span>
            <span className="text-gray-500 dark:text-gray-500">•</span>
            <span className="text-gray-600 dark:text-gray-400">{timeAgo}</span>

            {/* Sentiment */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sentimentColors[article.sentiment]}`} />
              <span className="text-gray-600 dark:text-gray-400 capitalize">{article.sentiment}</span>
            </div>
          </div>

          {/* Tickers */}
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
