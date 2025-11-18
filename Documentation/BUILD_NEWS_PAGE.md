# Build Instructions: News Page

**Page Route:** `/news`
**Estimated Time:** 6-7 days
**Priority:** Quick Win

---

## 🎯 Goal

Build a complete News page with financial news aggregation, filtering, sentiment analysis, and ticker-specific news feeds using NewsAPI.

---

## 📋 Step-by-Step Instructions

### PHASE 1: Backend Service (2-3 days)

#### Step 1.1: Create News Service

**File:** `backend/app/services/news_service.py` (NEW FILE)

```python
import requests
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.core.config import settings


class NewsService:
    """Financial news aggregation service"""

    BASE_URL = "https://newsapi.org/v2"

    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.session = requests.Session()

    def get_top_headlines(
        self,
        category: str = "business",
        country: str = "us",
        page_size: int = 20
    ) -> List[Dict]:
        """Get top business/financial headlines"""
        try:
            params = {
                "apiKey": self.api_key,
                "category": category,
                "country": country,
                "pageSize": page_size
            }

            response = self.session.get(f"{self.BASE_URL}/top-headlines", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            return self._format_articles(data.get("articles", []))
        except Exception as e:
            print(f"Error fetching headlines: {e}")
            return []

    def search_news(
        self,
        query: str,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        sort_by: str = "publishedAt",
        page_size: int = 20,
        page: int = 1
    ) -> Dict:
        """Search news articles"""
        try:
            if not from_date:
                from_date = datetime.now() - timedelta(days=30)

            params = {
                "apiKey": self.api_key,
                "q": query,
                "from": from_date.isoformat(),
                "sortBy": sort_by,
                "pageSize": page_size,
                "page": page,
                "language": "en"
            }

            if to_date:
                params["to"] = to_date.isoformat()

            response = self.session.get(f"{self.BASE_URL}/everything", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            return {
                "articles": self._format_articles(data.get("articles", [])),
                "total_results": data.get("totalResults", 0),
                "page": page
            }
        except Exception as e:
            print(f"Error searching news: {e}")
            return {"articles": [], "total_results": 0, "page": page}

    def get_ticker_news(
        self,
        ticker: str,
        days_back: int = 7
    ) -> List[Dict]:
        """Get news for specific ticker"""
        try:
            # Search for ticker symbol
            query = f"{ticker} stock"
            from_date = datetime.now() - timedelta(days=days_back)

            result = self.search_news(
                query=query,
                from_date=from_date,
                sort_by="publishedAt",
                page_size=50
            )

            # Filter articles that mention the ticker
            articles = [
                article for article in result["articles"]
                if ticker.upper() in article["title"].upper() or
                   ticker.upper() in (article["description"] or "").upper()
            ]

            return articles[:20]  # Return top 20
        except Exception as e:
            print(f"Error fetching ticker news: {e}")
            return []

    def get_market_sentiment(self) -> Dict:
        """Get overall market sentiment from recent news"""
        try:
            articles = self.get_top_headlines(page_size=100)

            sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
            for article in articles:
                sentiment_counts[article["sentiment"]] += 1

            total = len(articles)
            sentiment_score = (
                (sentiment_counts["positive"] * 100 + sentiment_counts["neutral"] * 50) / total
            ) if total > 0 else 50

            return {
                "score": round(sentiment_score, 2),
                "distribution": sentiment_counts,
                "total_articles": total
            }
        except Exception as e:
            print(f"Error calculating sentiment: {e}")
            return {"score": 50, "distribution": {"positive": 0, "neutral": 0, "negative": 0}, "total_articles": 0}

    def _format_articles(self, articles: List[Dict]) -> List[Dict]:
        """Format and enrich articles with sentiment"""
        formatted = []
        for article in articles:
            formatted.append({
                "title": article.get("title"),
                "description": article.get("description"),
                "url": article.get("url"),
                "source": article.get("source", {}).get("name"),
                "published_at": article.get("publishedAt"),
                "image_url": article.get("urlToImage"),
                "author": article.get("author"),
                "sentiment": self._analyze_sentiment(article.get("title", "") + " " + (article.get("description") or "")),
                "tickers": self._extract_tickers(article.get("title", "") + " " + (article.get("description") or ""))
            })
        return formatted

    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis"""
        text_lower = text.lower()

        positive_words = ["surge", "gain", "rise", "rally", "beat", "profit", "growth", "up", "soar", "jump", "win", "success"]
        negative_words = ["drop", "fall", "decline", "loss", "miss", "down", "crash", "plunge", "tank", "fail", "cut", "warning"]

        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)

        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        else:
            return "neutral"

    def _extract_tickers(self, text: str) -> List[str]:
        """Extract stock tickers from text"""
        # Match common ticker patterns (1-5 uppercase letters)
        pattern = r'\b[A-Z]{1,5}\b'
        potential_tickers = re.findall(pattern, text)

        # Filter out common words that aren't tickers
        exclude = {"US", "UK", "CEO", "CFO", "IPO", "ETF", "SEC", "FED", "GDP", "CPI", "AI", "IT", "TV", "PC", "USA", "EU"}
        tickers = [t for t in potential_tickers if t not in exclude]

        return list(set(tickers))[:5]  # Max 5 unique tickers
```

#### Step 1.2: Create News Router

**File:** `backend/app/api/v1/news.py` (NEW FILE)

```python
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime

from app.services.news_service import NewsService

router = APIRouter(prefix="/news", tags=["news"])
news_service = NewsService()


@router.get("/headlines")
def get_headlines(
    category: str = "business",
    page_size: int = 20
):
    """Get top financial headlines"""
    return news_service.get_top_headlines(category, page_size=page_size)


@router.get("/search")
def search_news(
    q: str = Query(..., description="Search query"),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    sort_by: str = "publishedAt",
    page: int = 1,
    page_size: int = 20
):
    """Search news articles"""
    from_dt = datetime.fromisoformat(from_date) if from_date else None
    to_dt = datetime.fromisoformat(to_date) if to_date else None

    return news_service.search_news(
        query=q,
        from_date=from_dt,
        to_date=to_dt,
        sort_by=sort_by,
        page=page,
        page_size=page_size
    )


@router.get("/ticker/{ticker}")
def get_ticker_news(
    ticker: str,
    days_back: int = 7
):
    """Get news for specific ticker"""
    return news_service.get_ticker_news(ticker, days_back)


@router.get("/sentiment")
def get_market_sentiment():
    """Get overall market sentiment from recent news"""
    return news_service.get_market_sentiment()
```

#### Step 1.3: Register Router

**File:** `backend/app/main.py`

Add these lines:

```python
from app.api.v1 import news

# ... existing code ...

app.include_router(news.router, prefix="/api/v1")
```

#### Step 1.4: Verify API Key

**File:** `backend/.env`

Make sure this line exists:

```
NEWS_API_KEY=your_newsapi_key_here
```

Get a free key at: https://newsapi.org/register

#### Step 1.5: Test Backend

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test endpoints
curl http://localhost:8000/api/v1/news/headlines
curl "http://localhost:8000/api/v1/news/search?q=Apple%20stock"
curl http://localhost:8000/api/v1/news/ticker/AAPL
curl http://localhost:8000/api/v1/news/sentiment
```

---

### PHASE 2: Frontend API Layer (1 day)

#### Step 2.1: Create News API Client

**File:** `frontend/lib/api/news.ts` (NEW FILE)

```typescript
import { apiClient } from './client';

export const newsApi = {
  getHeadlines: async (category: string = 'business', pageSize: number = 20) => {
    const response = await apiClient.get('/news/headlines', {
      params: { category, page_size: pageSize },
    });
    return response.data;
  },

  searchNews: async (
    query: string,
    options: {
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    const response = await apiClient.get('/news/search', {
      params: {
        q: query,
        from_date: options.fromDate,
        to_date: options.toDate,
        sort_by: options.sortBy || 'publishedAt',
        page: options.page || 1,
        page_size: options.pageSize || 20,
      },
    });
    return response.data;
  },

  getTickerNews: async (ticker: string, daysBack: number = 7) => {
    const response = await apiClient.get(`/news/ticker/${ticker}`, {
      params: { days_back: daysBack },
    });
    return response.data;
  },

  getMarketSentiment: async () => {
    const response = await apiClient.get('/news/sentiment');
    return response.data;
  },
};
```

#### Step 2.2: Create News Hooks

**File:** `frontend/lib/hooks/useNews.ts` (NEW FILE)

```typescript
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { newsApi } from '@/lib/api/news';

export function useHeadlines(category: string = 'business', pageSize: number = 20) {
  return useQuery({
    queryKey: ['headlines', category],
    queryFn: () => newsApi.getHeadlines(category, pageSize),
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
    queryKey: ['news-search', query, filters],
    queryFn: ({ pageParam = 1 }) =>
      newsApi.searchNews(query, { ...filters, page: pageParam }),
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
    queryKey: ['ticker-news', ticker, daysBack],
    queryFn: () => newsApi.getTickerNews(ticker, daysBack),
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    enabled: !!ticker,
  });
}

export function useMarketSentiment() {
  return useQuery({
    queryKey: ['market-sentiment'],
    queryFn: () => newsApi.getMarketSentiment(),
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}
```

---

### PHASE 3: Frontend Components (2 days)

#### Step 3.1: News Card Component

**File:** `frontend/components/news/news-card.tsx`

```typescript
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
```

#### Step 3.2: News Feed with Infinite Scroll

**File:** `frontend/components/news/news-feed.tsx`

```typescript
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
```

#### Step 3.3: Sentiment Gauge

**File:** `frontend/components/news/sentiment-gauge.tsx`

```typescript
'use client';

import { useMarketSentiment } from '@/lib/hooks/useNews';

export function SentimentGauge() {
  const { data, isLoading } = useMarketSentiment();

  if (isLoading || !data) {
    return null;
  }

  const getColor = (score: number) => {
    if (score >= 60) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getSentiment = (score: number) => {
    if (score >= 60) return 'Positive';
    if (score >= 40) return 'Neutral';
    return 'Negative';
  };

  return (
    <div className={`rounded-lg p-6 ${getColor(data.score)}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-80">Market Sentiment</h3>
          <div className="text-3xl font-bold mt-1">
            {data.score}/100
          </div>
          <div className="text-sm font-medium mt-1">{getSentiment(data.score)}</div>
        </div>

        <div className="text-sm opacity-80">
          <div>Positive: {data.distribution.positive}</div>
          <div>Neutral: {data.distribution.neutral}</div>
          <div>Negative: {data.distribution.negative}</div>
        </div>
      </div>
    </div>
  );
}
```

---

### PHASE 4: Main Page (1 day)

**File:** `frontend/app/news/page.tsx`

```typescript
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
```

---

## ✅ Testing Checklist

- [ ] Headlines endpoint returns articles
- [ ] Search functionality works
- [ ] Ticker news displays correctly
- [ ] Sentiment analysis showing colors
- [ ] Infinite scroll loads more articles
- [ ] Ticker tags are clickable and filter news
- [ ] Images load (with fallback on error)
- [ ] Time stamps show relative time
- [ ] External links open in new tabs
- [ ] Page is responsive
- [ ] Dark mode works

---

## 🚀 Running the Page

1. **Get NewsAPI key:** https://newsapi.org/register
2. **Add to backend/.env:** `NEWS_API_KEY=your_key_here`
3. **Start backend:** `cd backend && uvicorn app.main:app --reload`
4. **Start frontend:** `cd frontend && npm run dev`
5. **Navigate to:** `http://localhost:3000/news`

---

## 📝 Notes

- Free tier: 100 requests/day (enough for testing)
- DO NOT modify sidebar.tsx
- Use date-fns for relative times
- Add proper error handling for missing images
- Sentiment analysis is basic - can be improved with ML later
