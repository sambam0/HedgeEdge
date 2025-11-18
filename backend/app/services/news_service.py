import requests
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.core.config import settings


class NewsService:
    """Financial news aggregation service using NewsAPI.org"""

    BASE_URL = "https://newsapi.org/v2"

    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.session = requests.Session()
        # Simple cache to reduce API calls
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes

    def get_top_headlines(
        self,
        category: str = "business",
        country: str = "us",
        page_size: int = 20
    ) -> List[Dict]:
        """Get top business/financial headlines"""
        cache_key = f"headlines_{category}_{country}_{page_size}"

        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if datetime.now().timestamp() - cached_time < self.cache_ttl:
                return cached_data

        try:
            params = {
                "apiKey": self.api_key,
                "category": category,
                "country": country,
                "pageSize": page_size
            }

            response = self.session.get(
                f"{self.BASE_URL}/top-headlines",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "error":
                raise Exception(data.get("message", "NewsAPI error"))

            articles = self._format_articles(data.get("articles", []))

            # Cache the results
            self.cache[cache_key] = (datetime.now().timestamp(), articles)

            return articles

        except Exception as e:
            print(f"Error fetching headlines: {e}")
            # Return empty list on error
            return []

    def search_news(
        self,
        query: str,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        sort_by: str = "publishedAt",
        page: int = 1,
        page_size: int = 20
    ) -> Dict:
        """Search news articles with filters"""
        if not from_date:
            from_date = datetime.now() - timedelta(days=30)

        if not to_date:
            to_date = datetime.now()

        try:
            params = {
                "apiKey": self.api_key,
                "q": query,
                "from": from_date.strftime("%Y-%m-%d"),
                "to": to_date.strftime("%Y-%m-%d"),
                "sortBy": sort_by,
                "pageSize": page_size,
                "page": page,
                "language": "en"
            }

            response = self.session.get(
                f"{self.BASE_URL}/everything",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "error":
                raise Exception(data.get("message", "NewsAPI error"))

            return {
                "articles": self._format_articles(data.get("articles", [])),
                "total_results": data.get("totalResults", 0),
                "page": page
            }

        except Exception as e:
            print(f"Error searching news: {e}")
            return {
                "articles": [],
                "total_results": 0,
                "page": page
            }

    def get_ticker_news(
        self,
        ticker: str,
        days_back: int = 7
    ) -> List[Dict]:
        """Get news for specific ticker"""
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
        ticker_upper = ticker.upper()
        articles = [
            article for article in result["articles"]
            if ticker_upper in article.get("title", "").upper() or
               ticker_upper in article.get("description", "").upper()
        ]

        return articles[:20]  # Return max 20 articles

    def get_market_sentiment(self) -> Dict:
        """Calculate overall market sentiment from recent news"""
        articles = self.get_top_headlines(page_size=100)

        sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
        for article in articles:
            sentiment = article.get("sentiment", "neutral")
            sentiment_counts[sentiment] += 1

        total = len(articles)

        # Calculate sentiment score (0-100)
        # positive = 100, neutral = 50, negative = 0
        sentiment_score = (
            (sentiment_counts["positive"] * 100 + sentiment_counts["neutral"] * 50) / total
        ) if total > 0 else 50

        return {
            "score": round(sentiment_score, 1),
            "distribution": sentiment_counts,
            "total_articles": total
        }

    def _format_articles(self, articles: List[Dict]) -> List[Dict]:
        """Format and enrich articles with sentiment and tickers"""
        formatted = []

        for article in articles:
            title = article.get("title", "")
            description = article.get("description", "") or ""

            # Skip articles with removed content
            if title == "[Removed]" or not title:
                continue

            formatted_article = {
                "title": title,
                "description": description,
                "url": article.get("url"),
                "source": article.get("source", {}).get("name"),
                "published_at": article.get("publishedAt"),
                "image_url": article.get("urlToImage"),
                "author": article.get("author"),
                "sentiment": self._analyze_sentiment(title + " " + description),
                "tickers": self._extract_tickers(title + " " + description)
            }

            formatted.append(formatted_article)

        return formatted

    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis based on keyword matching"""
        if not text:
            return "neutral"

        text_lower = text.lower()

        # Positive keywords
        positive_words = [
            "surge", "gain", "rise", "rally", "beat", "profit", "growth",
            "up", "soar", "bullish", "strong", "record", "high", "win",
            "success", "boost", "jump", "climb", "advance", "outperform"
        ]

        # Negative keywords
        negative_words = [
            "drop", "fall", "decline", "loss", "miss", "down", "crash",
            "plunge", "tank", "bearish", "weak", "slump", "tumble",
            "slide", "sink", "plummet", "warning", "concern", "risk"
        ]

        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)

        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        else:
            return "neutral"

    def _extract_tickers(self, text: str) -> List[str]:
        """Extract potential stock tickers from text"""
        if not text:
            return []

        # Match 1-5 uppercase letters that are likely tickers
        pattern = r'\b[A-Z]{1,5}\b'
        potential_tickers = re.findall(pattern, text)

        # Filter out common words that aren't tickers
        exclude = [
            "US", "UK", "CEO", "CFO", "IPO", "ETF", "SEC", "FED", "GDP",
            "CPI", "AI", "IT", "TV", "PC", "USA", "NYSE", "API", "FAQ",
            "PDF", "HTML", "CSS", "SQL", "JSON", "HTTP", "HTTPS", "FTP",
            "USB", "GPS", "FBI", "CIA", "NASA", "NATO", "UN", "EU",
            "AM", "PM", "ET", "PT", "CT", "MT", "EST", "PST", "CST",
            "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL",
            "CAN", "HER", "WAS", "ONE", "OUR", "OUT", "DAY", "GET",
            "HAS", "HIM", "HIS", "HOW", "ITS", "MAY", "NEW", "NOW",
            "OLD", "SEE", "TWO", "WHO", "BOY", "DID", "ITS", "LET",
            "PUT", "SAY", "SHE", "TOO", "USE", "WAY", "WHY", "YOU"
        ]

        tickers = [t for t in potential_tickers if t not in exclude]

        # Remove duplicates and return max 5
        return list(dict.fromkeys(tickers))[:5]


# Create singleton instance
news_service = NewsService()
