# Missing Pages Implementation Plan
## /markets, /analysis, /news

**Created:** 2025-11-18
**Status:** Planning Complete
**Estimated Total Time:** 8-10 days

---

## 📊 Available API Resources

### Currently Active:
- ✅ **Alpha Vantage** - Real-time quotes, historical data, intraday prices, company overview, symbol search
- ✅ **FRED** - Economic indicators (Fed funds, CPI, unemployment, GDP, yields)
- ✅ **yfinance** - Supplementary market data

### Configured But Unused:
- 🔑 **FMP API** (Financial Modeling Prep) - Advanced financial data, earnings, ratios, insider trading
- 🔑 **NEWS API** - Financial news articles, sentiment, headlines

---

## 🎯 PAGE 1: Markets Page (`/markets`)

### Purpose
**Advanced market monitoring with detailed stock analysis, real-time charts, and market depth**

### Target Route
`/markets` → `frontend/app/markets/page.tsx`

### Key Features

#### 1. **Market Overview Section**
- Major indices cards (S&P 500, NASDAQ, Dow Jones, Russell 2000)
- Real-time price updates every 15 seconds
- Heat map of sector performance
- Market breadth indicators (Advance/Decline ratio)

#### 2. **Stock Detail Panel**
- **Search Bar**: Symbol search with autocomplete
- **Price Chart**: Candlestick chart with volume
  - Timeframes: 1D (intraday), 5D, 1M, 3M, 6M, 1Y, ALL
  - Technical indicators: SMA (20, 50, 200), RSI, MACD
  - Volume bars overlay
- **Key Metrics Card**:
  - Current price, change, % change
  - Day range (high/low)
  - 52-week range
  - Volume vs avg volume
  - Market cap, P/E ratio
- **Company Info**:
  - Company name, sector, industry
  - Description (expandable)
  - Headquarters, employees

#### 3. **Market Movers**
- Top gainers table (10 stocks)
- Top losers table (10 stocks)
- Most active by volume (10 stocks)
- Real-time updates every 30 seconds

#### 4. **Intraday Trading View**
- Real-time tick data for selected stock
- Level 2 market depth visualization (future enhancement)
- Bid/ask spread indicator

### Data Sources

#### Backend APIs Needed:

**Already Available:**
- `GET /api/v1/market/indices` - Market indices
- `GET /api/v1/market/quote/{ticker}` - Real-time quote
- `GET /api/v1/market/chart/{ticker}` - Historical chart data
- `GET /api/v1/market/search?q={query}` - Symbol search

**New Endpoints Required:**

1. **Intraday Data Endpoint**
```python
# backend/app/api/v1/market.py
@router.get("/intraday/{ticker}")
def get_intraday_data(
    ticker: str,
    interval: str = "5min"  # 1min, 5min, 15min, 30min, 60min
) -> List[IntradayBar]:
    """Get intraday price data for detailed charts"""
    return market_service.get_intraday_data(ticker, interval)
```

2. **Company Overview Endpoint**
```python
@router.get("/company/{ticker}")
def get_company_overview(ticker: str) -> CompanyOverview:
    """Get detailed company information and fundamentals"""
    return market_service.get_company_overview(ticker)
```

3. **Technical Indicators Endpoint**
```python
@router.get("/technical/{ticker}")
def get_technical_indicators(
    ticker: str,
    indicators: List[str] = ["SMA", "RSI", "MACD"]
) -> Dict[str, Any]:
    """Get calculated technical indicators"""
    return market_service.calculate_indicators(ticker, indicators)
```

#### Service Layer Updates:

**Update `market_service.py`:**
```python
def get_intraday_data(self, ticker: str, interval: str = "5min") -> List[Dict]:
    """Fetch intraday data from Alpha Vantage"""
    return self.alpha_vantage_client.get_intraday_prices(ticker, interval)

def get_company_overview(self, ticker: str) -> Dict:
    """Fetch company overview from Alpha Vantage"""
    overview = self.alpha_vantage_client.get_company_overview(ticker)
    # Cache for 24 hours (company info doesn't change frequently)
    return overview

def calculate_indicators(self, ticker: str, indicators: List[str]) -> Dict:
    """Calculate technical indicators on historical data"""
    # Get historical data
    data = self.get_chart_data(ticker, period="6M")

    results = {}
    if "SMA" in indicators:
        results["sma_20"] = calculate_sma(data, 20)
        results["sma_50"] = calculate_sma(data, 50)
        results["sma_200"] = calculate_sma(data, 200)

    if "RSI" in indicators:
        results["rsi"] = calculate_rsi(data, 14)

    if "MACD" in indicators:
        results["macd"] = calculate_macd(data)

    return results
```

### Frontend Implementation

#### Components Needed:

1. **`frontend/app/markets/page.tsx`** - Main markets page
2. **`frontend/components/markets/stock-search.tsx`** - Search with autocomplete
3. **`frontend/components/markets/stock-detail-panel.tsx`** - Detailed stock view
4. **`frontend/components/markets/company-info-card.tsx`** - Company information
5. **`frontend/components/markets/market-movers-table.tsx`** - Gainers/losers/active
6. **`frontend/components/markets/intraday-chart.tsx`** - Real-time intraday chart
7. **`frontend/components/charts/technical-indicators-chart.tsx`** - Chart with overlays

#### API Hooks:

**`frontend/lib/hooks/useMarket.ts` (extend existing):**
```typescript
export function useIntradayData(ticker: string, interval: string = "5min") {
  return useQuery({
    queryKey: ['intraday', ticker, interval],
    queryFn: () => marketApi.getIntradayData(ticker, interval),
    refetchInterval: 15000, // 15 seconds
    enabled: !!ticker,
  });
}

export function useCompanyOverview(ticker: string) {
  return useQuery({
    queryKey: ['company', ticker],
    queryFn: () => marketApi.getCompanyOverview(ticker),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!ticker,
  });
}

export function useTechnicalIndicators(ticker: string, indicators: string[]) {
  return useQuery({
    queryKey: ['technical', ticker, indicators],
    queryFn: () => marketApi.getTechnicalIndicators(ticker, indicators),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!ticker && indicators.length > 0,
  });
}
```

#### Page Layout:

```
┌─────────────────────────────────────────────────────┐
│  Market Overview (Indices + Sector Heatmap)         │
├─────────────────┬───────────────────────────────────┤
│                 │  Stock Search                     │
│  Market Movers  │  ┌─────────────────────────────┐ │
│  ┌───────────┐  │  │  Candlestick Chart         │ │
│  │ Gainers   │  │  │  w/ Volume & Indicators    │ │
│  │ Losers    │  │  └─────────────────────────────┘ │
│  │ Active    │  │  ┌──────────┐  ┌──────────────┐ │
│  └───────────┘  │  │Key Metrics│  │Company Info  │ │
│                 │  └──────────┘  └──────────────┘ │
└─────────────────┴───────────────────────────────────┘
```

### Implementation Steps

1. **Backend (2-3 days)**
   - [ ] Add intraday endpoint to market router
   - [ ] Add company overview endpoint
   - [ ] Add technical indicators endpoint
   - [ ] Implement technical indicator calculations (SMA, RSI, MACD)
   - [ ] Add response schemas for new endpoints
   - [ ] Test all endpoints with Postman/curl

2. **Frontend Data Layer (1 day)**
   - [ ] Add API functions to `market.ts`
   - [ ] Create new hooks in `useMarket.ts`
   - [ ] Test hooks with existing backend

3. **Frontend Components (2-3 days)**
   - [ ] Build stock search component with autocomplete
   - [ ] Create stock detail panel layout
   - [ ] Build company info card
   - [ ] Extend candlestick chart with technical indicators
   - [ ] Build intraday chart component
   - [ ] Create market movers table

4. **Integration & Polish (1 day)**
   - [ ] Assemble full markets page
   - [ ] Add real-time updates
   - [ ] Implement loading states
   - [ ] Add error handling
   - [ ] Test responsiveness
   - [ ] Add keyboard shortcuts (arrow keys for chart navigation)

**Total Estimated Time: 6-8 days**

---

## 📈 PAGE 2: Analysis Page (`/analysis`)

### Purpose
**Advanced portfolio and market analysis with correlation, risk metrics, and comparative analysis**

### Target Route
`/analysis` → `frontend/app/analysis/page.tsx`

### Key Features

#### 1. **Correlation Analysis**
- Correlation matrix between holdings
- Asset class correlation
- Sector correlation heatmap
- Time-period selector (1M, 3M, 6M, 1Y)

#### 2. **Risk Metrics Dashboard**
- **Portfolio Risk**:
  - Beta (vs S&P 500)
  - Standard deviation (volatility)
  - Sharpe ratio
  - Sortino ratio
  - Maximum drawdown
  - Value at Risk (VaR)
- **Position Risk**:
  - Individual stock volatility
  - Position concentration risk
  - Sector concentration

#### 3. **Performance Attribution**
- Sector performance contribution
- Individual position contribution
- Time-weighted returns
- Dollar-weighted returns

#### 4. **Comparative Analysis**
- Portfolio vs benchmarks (S&P 500, NASDAQ, custom)
- Risk-adjusted performance comparison
- Efficient frontier visualization
- Monte Carlo simulation (future)

#### 5. **Holdings Analysis**
- Diversification score
- Overlap analysis (if multiple portfolios)
- Asset allocation breakdown by multiple dimensions:
  - Sector
  - Market cap (large/mid/small)
  - Geography
  - Growth vs Value

### Data Sources

#### Backend APIs Needed:

**New Service: `analysis_service.py`**

```python
class AnalysisService:
    """Advanced portfolio and market analysis"""

    def calculate_correlation_matrix(
        self,
        tickers: List[str],
        period: str = "6M"
    ) -> Dict[str, Dict[str, float]]:
        """Calculate correlation between assets"""
        # Fetch historical data for all tickers
        # Calculate correlation coefficients
        # Return matrix

    def calculate_portfolio_risk_metrics(
        self,
        portfolio_id: int
    ) -> PortfolioRiskMetrics:
        """Calculate comprehensive risk metrics"""
        # Beta, volatility, Sharpe, Sortino, max drawdown, VaR

    def calculate_performance_attribution(
        self,
        portfolio_id: int,
        period: str = "1Y"
    ) -> PerformanceAttribution:
        """Breakdown performance by sector/position"""

    def compare_to_benchmark(
        self,
        portfolio_id: int,
        benchmark: str = "SPY",
        period: str = "1Y"
    ) -> BenchmarkComparison:
        """Compare portfolio to benchmark"""

    def calculate_diversification_score(
        self,
        portfolio_id: int
    ) -> float:
        """Score from 0-100 based on concentration"""
```

**New Router: `backend/app/api/v1/analysis.py`**

```python
@router.get("/correlation")
def get_correlation_matrix(
    tickers: str,  # comma-separated
    period: str = "6M"
):
    """Get correlation matrix for assets"""

@router.get("/portfolio/{portfolio_id}/risk")
def get_portfolio_risk_metrics(portfolio_id: int):
    """Get comprehensive risk metrics"""

@router.get("/portfolio/{portfolio_id}/attribution")
def get_performance_attribution(
    portfolio_id: int,
    period: str = "1Y"
):
    """Get performance attribution analysis"""

@router.get("/portfolio/{portfolio_id}/benchmark")
def compare_to_benchmark(
    portfolio_id: int,
    benchmark: str = "SPY",
    period: str = "1Y"
):
    """Compare portfolio to benchmark"""

@router.get("/portfolio/{portfolio_id}/diversification")
def get_diversification_metrics(portfolio_id: int):
    """Get diversification score and metrics"""
```

#### Service Implementation Details:

**Risk Metrics Calculations:**

```python
import numpy as np
import pandas as pd
from scipy import stats

def calculate_beta(portfolio_returns: List[float], market_returns: List[float]) -> float:
    """Calculate portfolio beta vs market"""
    covariance = np.cov(portfolio_returns, market_returns)[0][1]
    market_variance = np.var(market_returns)
    return covariance / market_variance

def calculate_sharpe_ratio(
    returns: List[float],
    risk_free_rate: float = 0.04
) -> float:
    """Calculate Sharpe ratio"""
    excess_returns = np.array(returns) - (risk_free_rate / 252)  # Daily risk-free
    return np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)

def calculate_sortino_ratio(
    returns: List[float],
    risk_free_rate: float = 0.04
) -> float:
    """Calculate Sortino ratio (downside deviation)"""
    excess_returns = np.array(returns) - (risk_free_rate / 252)
    downside_returns = excess_returns[excess_returns < 0]
    downside_std = np.std(downside_returns)
    return np.mean(excess_returns) / downside_std * np.sqrt(252)

def calculate_max_drawdown(prices: List[float]) -> Dict:
    """Calculate maximum drawdown"""
    peak = prices[0]
    max_dd = 0
    max_dd_date = None

    for i, price in enumerate(prices):
        if price > peak:
            peak = price
        dd = (peak - price) / peak
        if dd > max_dd:
            max_dd = dd
            max_dd_date = i

    return {
        "max_drawdown": max_dd,
        "max_drawdown_pct": max_dd * 100,
        "date_index": max_dd_date
    }

def calculate_var(returns: List[float], confidence: float = 0.95) -> float:
    """Calculate Value at Risk"""
    return np.percentile(returns, (1 - confidence) * 100)
```

### Frontend Implementation

#### Components Needed:

1. **`frontend/app/analysis/page.tsx`** - Main analysis page
2. **`frontend/components/analysis/correlation-matrix-section.tsx`** - Correlation analysis
3. **`frontend/components/analysis/risk-metrics-dashboard.tsx`** - Risk metrics cards
4. **`frontend/components/analysis/performance-attribution.tsx`** - Attribution breakdown
5. **`frontend/components/analysis/benchmark-comparison.tsx`** - Portfolio vs benchmark
6. **`frontend/components/analysis/diversification-score.tsx`** - Diversification metrics
7. **`frontend/components/charts/efficient-frontier.tsx`** - Risk/return scatter plot

#### API Hooks:

**`frontend/lib/hooks/useAnalysis.ts` (new file):**

```typescript
export function useCorrelationMatrix(tickers: string[], period: string = "6M") {
  return useQuery({
    queryKey: ['correlation', tickers, period],
    queryFn: () => analysisApi.getCorrelationMatrix(tickers.join(','), period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: tickers.length > 1,
  });
}

export function usePortfolioRiskMetrics(portfolioId: number) {
  return useQuery({
    queryKey: ['portfolio-risk', portfolioId],
    queryFn: () => analysisApi.getPortfolioRiskMetrics(portfolioId),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    enabled: !!portfolioId,
  });
}

export function usePerformanceAttribution(portfolioId: number, period: string = "1Y") {
  return useQuery({
    queryKey: ['attribution', portfolioId, period],
    queryFn: () => analysisApi.getPerformanceAttribution(portfolioId, period),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useBenchmarkComparison(
  portfolioId: number,
  benchmark: string = "SPY",
  period: string = "1Y"
) {
  return useQuery({
    queryKey: ['benchmark', portfolioId, benchmark, period],
    queryFn: () => analysisApi.compareToBenchmark(portfolioId, benchmark, period),
    staleTime: 30 * 60 * 1000,
  });
}
```

#### Page Layout:

```
┌─────────────────────────────────────────────────────┐
│  Portfolio Selector Dropdown                        │
├──────────────────────┬──────────────────────────────┤
│  Risk Metrics        │  Benchmark Comparison        │
│  ┌────────────────┐  │  ┌────────────────────────┐  │
│  │ Beta: 1.15     │  │  │ Chart: Portfolio vs    │  │
│  │ Sharpe: 1.84   │  │  │        S&P 500         │  │
│  │ Sortino: 2.12  │  │  └────────────────────────┘  │
│  │ Max DD: -12.3% │  │                              │
│  │ VaR (95%): -2% │  │                              │
│  └────────────────┘  │                              │
├──────────────────────┴──────────────────────────────┤
│  Correlation Matrix                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │        AAPL   MSFT   GOOGL  AMZN   SPY       │  │
│  │  AAPL   1.00  0.87   0.82   0.75   0.91     │  │
│  │  MSFT   0.87  1.00   0.89   0.78   0.94     │  │
│  │  ...                                         │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Performance Attribution                            │
│  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ By Sector      │  │ By Position                │ │
│  │ Tech: +15.2%   │  │ AAPL: +3.2%               │ │
│  │ Finance: +8.1% │  │ MSFT: +2.8%               │ │
│  └────────────────┘  └────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Diversification Score: 78/100                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ Sector concentration: Medium                  │  │
│  │ Position concentration: Low                   │  │
│  │ Geographic concentration: High (95% US)       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Backend (3-4 days)**
   - [ ] Create `analysis_service.py` with all calculations
   - [ ] Implement correlation matrix calculation
   - [ ] Implement risk metrics (Beta, Sharpe, Sortino, Max DD, VaR)
   - [ ] Implement performance attribution logic
   - [ ] Implement benchmark comparison
   - [ ] Create `analysis.py` router with all endpoints
   - [ ] Add schemas for all response models
   - [ ] Test calculations with sample portfolios

2. **Frontend Data Layer (1 day)**
   - [ ] Create `analysis.ts` API client
   - [ ] Create `useAnalysis.ts` hooks file
   - [ ] Test hooks with backend

3. **Frontend Components (2-3 days)**
   - [ ] Build risk metrics dashboard
   - [ ] Create correlation matrix visualization (reuse existing)
   - [ ] Build performance attribution component
   - [ ] Build benchmark comparison chart
   - [ ] Create diversification score widget
   - [ ] Build efficient frontier chart (bonus)

4. **Integration & Polish (1 day)**
   - [ ] Assemble full analysis page
   - [ ] Add portfolio selector
   - [ ] Implement period filters
   - [ ] Add loading states
   - [ ] Add error handling
   - [ ] Add tooltips explaining metrics
   - [ ] Export to PDF functionality

**Total Estimated Time: 7-9 days**

---

## 📰 PAGE 3: News Page (`/news`)

### Purpose
**Financial news aggregation with filtering, sentiment analysis, and ticker-specific news**

### Target Route
`/news` → `frontend/app/news/page.tsx`

### Key Features

#### 1. **News Feed**
- Latest financial news articles
- Infinite scroll pagination
- Article cards with:
  - Headline
  - Source
  - Publication time (relative: "2h ago")
  - Thumbnail image
  - Brief description
  - Related tickers (clickable tags)
  - Sentiment indicator (positive/neutral/negative)

#### 2. **Filtering & Search**
- **Filter by source**: Bloomberg, Reuters, WSJ, CNBC, etc.
- **Filter by category**:
  - Market News
  - Earnings
  - M&A
  - Economic Data
  - Crypto
  - Commodities
- **Filter by ticker**: Show news for specific stocks
- **Search**: Full-text search across headlines and descriptions
- **Sort by**: Relevance, Date (newest/oldest), Popularity

#### 3. **Ticker-Specific News Panel**
- Search for a ticker
- See all news mentioning that company
- Sentiment trend over time (chart)
- Breaking news alerts (highlighted)

#### 4. **Market Headlines Widget**
- Top 5 breaking news items
- Auto-refresh every 5 minutes
- Can be embedded in Dashboard too

#### 5. **News Sentiment Dashboard**
- Overall market sentiment gauge (0-100)
- Sentiment by sector
- Sentiment timeline chart
- Most mentioned tickers

### Data Sources

#### News API Integration

**Service: `news_service.py` (new)**

```python
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.core.config import settings

class NewsService:
    """Financial news aggregation service"""

    # Using NewsAPI.org (https://newsapi.org/)
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
        params = {
            "apiKey": self.api_key,
            "category": category,
            "country": country,
            "pageSize": page_size
        }
        response = self.session.get(f"{self.BASE_URL}/top-headlines", params=params)
        data = response.json()
        return self._format_articles(data.get("articles", []))

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
        if not from_date:
            from_date = datetime.now() - timedelta(days=30)

        params = {
            "apiKey": self.api_key,
            "q": query,
            "from": from_date.isoformat(),
            "to": to_date.isoformat() if to_date else None,
            "sortBy": sort_by,
            "pageSize": page_size,
            "page": page,
            "language": "en"
        }
        response = self.session.get(f"{self.BASE_URL}/everything", params=params)
        data = response.json()
        return {
            "articles": self._format_articles(data.get("articles", [])),
            "total_results": data.get("totalResults", 0),
            "page": page
        }

    def get_ticker_news(
        self,
        ticker: str,
        days_back: int = 7
    ) -> List[Dict]:
        """Get news for specific ticker"""
        # Get company name from market service
        from app.services.market_service import MarketService
        market_service = MarketService(db=None)  # Adjust as needed

        # Search for ticker symbol and company name
        query = f"{ticker} OR stock"
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
               ticker.upper() in article["description"].upper()
        ]

        return articles

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
                "sentiment": self._analyze_sentiment(article.get("title", "")),
                "tickers": self._extract_tickers(article.get("title", "") + " " + article.get("description", ""))
            })
        return formatted

    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis (can be improved with ML)"""
        text_lower = text.lower()

        positive_words = ["surge", "gain", "rise", "rally", "beat", "profit", "growth", "up", "soar"]
        negative_words = ["drop", "fall", "decline", "loss", "miss", "down", "crash", "plunge", "tank"]

        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)

        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        else:
            return "neutral"

    def _extract_tickers(self, text: str) -> List[str]:
        """Extract stock tickers from text (basic pattern matching)"""
        import re
        # Match common ticker patterns (1-5 uppercase letters)
        pattern = r'\b[A-Z]{1,5}\b'
        potential_tickers = re.findall(pattern, text)

        # Filter out common words that aren't tickers
        exclude = ["US", "UK", "CEO", "CFO", "IPO", "ETF", "SEC", "FED", "GDP", "CPI", "AI"]
        tickers = [t for t in potential_tickers if t not in exclude]

        return list(set(tickers))[:5]  # Max 5 tickers per article
```

**Router: `backend/app/api/v1/news.py` (new)**

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
    articles = news_service.get_top_headlines(page_size=100)

    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    for article in articles:
        sentiment_counts[article["sentiment"]] += 1

    total = len(articles)
    sentiment_score = (
        (sentiment_counts["positive"] * 100 + sentiment_counts["neutral"] * 50) / total
    ) if total > 0 else 50

    return {
        "score": sentiment_score,
        "distribution": sentiment_counts,
        "total_articles": total
    }
```

**Register router in `main.py`:**
```python
from app.api.v1 import news
app.include_router(news.router, prefix="/api/v1")
```

### Frontend Implementation

#### Components Needed:

1. **`frontend/app/news/page.tsx`** - Main news page
2. **`frontend/components/news/news-feed.tsx`** - Infinite scroll feed
3. **`frontend/components/news/news-card.tsx`** - Individual article card
4. **`frontend/components/news/news-filters.tsx`** - Filter sidebar
5. **`frontend/components/news/ticker-news-panel.tsx`** - Ticker-specific news
6. **`frontend/components/news/sentiment-gauge.tsx`** - Sentiment indicator
7. **`frontend/components/news/breaking-news-banner.tsx`** - Top headlines widget

#### API Hooks:

**`frontend/lib/hooks/useNews.ts` (new file):**

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
      const hasMore = lastPage.articles.length === 20; // page_size
      return hasMore ? pages.length + 1 : undefined;
    },
    enabled: !!query,
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

**`frontend/lib/api/news.ts` (new file):**

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

#### Page Layout:

```
┌─────────────────────────────────────────────────────┐
│  Market Sentiment: 67/100 (Positive) ↑              │
├────────────┬────────────────────────────────────────┤
│  Filters   │  News Feed                             │
│            │  ┌──────────────────────────────────┐  │
│  Sources:  │  │ [IMG] Breaking: Fed Holds Rates  │  │
│  ☑ All     │  │ Bloomberg • 2h ago               │  │
│  ☐ Reuters │  │ Sentiment: ● Neutral             │  │
│  ☐ WSJ     │  │ Tags: [FED] [RATES]             │  │
│  ☐ CNBC    │  └──────────────────────────────────┘  │
│            │  ┌──────────────────────────────────┐  │
│  Category: │  │ [IMG] Apple Beats Earnings       │  │
│  ☑ All     │  │ CNBC • 4h ago                    │  │
│  ☐ Earnings│  │ Sentiment: ● Positive            │  │
│  ☐ M&A     │  │ Tags: [AAPL] [EARNINGS]         │  │
│  ☐ Economic│  └──────────────────────────────────┘  │
│            │  ┌──────────────────────────────────┐  │
│  Ticker:   │  │ [IMG] Market Sell-Off Continues  │  │
│  [Search]  │  │ Reuters • 5h ago                 │  │
│            │  │ Sentiment: ● Negative            │  │
│            │  │ Tags: [SPY] [MARKET]            │  │
│            │  └──────────────────────────────────┘  │
│            │  [Load More...]                        │
└────────────┴────────────────────────────────────────┘
```

### Implementation Steps

1. **Backend (2-3 days)**
   - [ ] Create `news_service.py` with NewsAPI integration
   - [ ] Implement headline fetching
   - [ ] Implement news search with pagination
   - [ ] Implement ticker-specific news
   - [ ] Add basic sentiment analysis
   - [ ] Add ticker extraction from text
   - [ ] Create `news.py` router with all endpoints
   - [ ] Register router in main.py
   - [ ] Test with real NewsAPI key

2. **Frontend Data Layer (1 day)**
   - [ ] Create `news.ts` API client
   - [ ] Create `useNews.ts` hooks
   - [ ] Test infinite scroll with `useInfiniteQuery`

3. **Frontend Components (2 days)**
   - [ ] Build news card component
   - [ ] Build news feed with infinite scroll
   - [ ] Create filter sidebar
   - [ ] Build sentiment gauge
   - [ ] Create ticker news panel
   - [ ] Build breaking news banner

4. **Integration & Polish (1 day)**
   - [ ] Assemble full news page
   - [ ] Add filter functionality
   - [ ] Implement search
   - [ ] Add loading states and skeletons
   - [ ] Add error handling
   - [ ] Add "Share article" functionality
   - [ ] Add "Read later" bookmarking (optional)
   - [ ] Test responsive design

**Total Estimated Time: 6-7 days**

---

## 📋 Summary & Timeline

### Total Implementation Estimate

| Page | Backend | Frontend | Total |
|------|---------|----------|-------|
| Markets | 2-3 days | 3-4 days | **6-8 days** |
| Analysis | 3-4 days | 3-4 days | **7-9 days** |
| News | 2-3 days | 3 days | **6-7 days** |
| **TOTAL** | **8-10 days** | **10-12 days** | **8-10 days** (parallel) |

**If working sequentially:** 19-24 days
**If working in parallel (2 devs):** 10-13 days
**If you build one at a time:** Can deliver each page incrementally

### Recommended Order

**Option A: Feature Value Priority**
1. **Markets** (most valuable for traders - detailed stock analysis)
2. **News** (quick win, high engagement)
3. **Analysis** (advanced feature, fewer users need it immediately)

**Option B: Complexity Priority**
1. **News** (easiest, fastest to implement)
2. **Markets** (medium complexity)
3. **Analysis** (most complex calculations)

**Option C: User Journey Priority**
1. **Markets** (research stocks)
2. **Analysis** (analyze portfolio risk)
3. **News** (stay informed)

---

## 🔑 API Keys Required

### Already Configured:
- ✅ Alpha Vantage API Key
- ✅ FRED API Key

### Need to Activate:
- 🔑 **NewsAPI Key** - Get from https://newsapi.org/
  - Free tier: 100 requests/day, 1000/month
  - Developer tier: $449/month for production
  - **Alternative**: Use free RSS feeds or Finnhub API

- 🔑 **FMP API Key** (Optional but recommended)
  - Already configured, just need to start using it
  - Free tier: 250 requests/day
  - Can supplement Alpha Vantage data

---

## 🎯 Next Steps

1. **Review this plan** and decide which page to build first
2. **Verify API keys** are working (especially NEWS_API_KEY)
3. **Choose implementation approach**:
   - Build all three pages in parallel (fastest)
   - Build one at a time (safer, incremental delivery)
4. **Set up testing strategy** for each page
5. **Start with backend services** for chosen page(s)

---

## 📊 Success Metrics

### Markets Page
- [ ] Can view detailed stock info within 2 seconds
- [ ] Candlestick chart loads with intraday data
- [ ] Technical indicators display correctly
- [ ] Search finds stocks instantly
- [ ] Real-time updates working every 15s

### Analysis Page
- [ ] Risk metrics calculated correctly
- [ ] Correlation matrix displays for portfolio
- [ ] Performance attribution shows breakdown
- [ ] Benchmark comparison chart renders
- [ ] All calculations complete within 3 seconds

### News Page
- [ ] News feed loads latest articles
- [ ] Infinite scroll working smoothly
- [ ] Filters apply without lag
- [ ] Ticker-specific news displays
- [ ] Sentiment analysis shows on each article

---

**Ready to start implementation?** Let me know which page you'd like to tackle first, and I'll help you build it step by step!
