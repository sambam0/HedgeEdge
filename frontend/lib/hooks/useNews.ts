import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { newsAPI } from '../api/news';

export function useHeadlines(category: string = 'business', pageSize: number = 20) {
  return useQuery({
    queryKey: ['news', 'headlines', category, pageSize],
    queryFn: () => newsAPI.getHeadlines(category, pageSize),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useNewsSearch(
  query: string,
  filters: {
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
  } = {}
) {
  return useInfiniteQuery({
    queryKey: ['news', 'search', query, filters],
    queryFn: ({ pageParam }) =>
      newsAPI.searchNews(query, { ...filters, page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage.articles.length === 20;
      return hasMore ? pages.length + 1 : undefined;
    },
    enabled: !!query,
    initialPageParam: 1,
  });
}

export function useTickerNews(ticker: string, daysBack: number = 7) {
  return useQuery({
    queryKey: ['news', 'ticker', ticker, daysBack],
    queryFn: () => newsAPI.getTickerNews(ticker, daysBack),
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    enabled: !!ticker,
  });
}

export function useMarketSentiment() {
  return useQuery({
    queryKey: ['news', 'sentiment'],
    queryFn: () => newsAPI.getMarketSentiment(),
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}
