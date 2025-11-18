'use client';

import { useEffect, useRef } from 'react';
import { useNewsSearch } from '@/lib/hooks/useNews';
import { NewsCard } from './news-card';

interface NewsFeedProps {
  query: string;
  onTickerClick?: (ticker: string) => void;
}

export function NewsFeed({ query, onTickerClick }: NewsFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNewsSearch(query);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

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

  const articles = data?.pages.flatMap((page) => page.articles) || [];

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No news articles found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <NewsCard key={`${article.url}-${index}`} article={article} onTickerClick={onTickerClick} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-gray-600 dark:text-gray-400">Loading more...</span>
        )}
      </div>
    </div>
  );
}
