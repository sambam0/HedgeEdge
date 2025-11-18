import { apiClient } from './client';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
  author?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tickers: string[];
}

export interface NewsSearchResult {
  articles: NewsArticle[];
  total_results: number;
  page: number;
}

export interface MarketSentiment {
  score: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  total_articles: number;
}

export const newsAPI = {
  getHeadlines: (category: string = 'business', pageSize: number = 20) =>
    apiClient<NewsArticle[]>(
      `/api/v1/news/headlines?category=${category}&page_size=${pageSize}`
    ),

  searchNews: (
    query: string,
    options: {
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    const params = new URLSearchParams({
      q: query,
      sort_by: options.sortBy || 'publishedAt',
      page: String(options.page || 1),
      page_size: String(options.pageSize || 20),
    });

    if (options.fromDate) {
      params.append('from_date', options.fromDate);
    }
    if (options.toDate) {
      params.append('to_date', options.toDate);
    }

    return apiClient<NewsSearchResult>(`/api/v1/news/search?${params.toString()}`);
  },

  getTickerNews: (ticker: string, daysBack: number = 7) =>
    apiClient<NewsArticle[]>(
      `/api/v1/news/ticker/${ticker}?days_back=${daysBack}`
    ),

  getMarketSentiment: () =>
    apiClient<MarketSentiment>('/api/v1/news/sentiment'),
};
