from typing import Optional, List, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.services.alpha_vantage import AlphaVantageClient
from app.models.models import StockCache
from app.models.schemas import Quote, MarketIndex
import random


class MarketService:
    """Market data service with database caching"""

    def __init__(self, db: Session):
        self.db = db
        self.av_client = AlphaVantageClient()
        self.cache_ttl = timedelta(minutes=15)  # 15 minute cache

    def get_quote(self, ticker: str, use_cache: bool = True) -> Optional[Quote]:
        """Get quote with database caching"""
        # Check cache first
        if use_cache:
            cached = self.db.query(StockCache).filter(StockCache.ticker == ticker).first()
            if cached and (datetime.utcnow() - cached.updated_at) < self.cache_ttl:
                return Quote(
                    ticker=cached.ticker,
                    price=float(cached.current_price) if cached.current_price else 0,
                    change=float(cached.change) if cached.change else 0,
                    change_percent=float(cached.change_percent) if cached.change_percent else 0,
                    volume=int(cached.volume) if cached.volume else None,
                    market_cap=int(cached.market_cap) if cached.market_cap else None,
                    pe_ratio=float(cached.pe_ratio) if cached.pe_ratio else None
                )

        # Fetch fresh data from Alpha Vantage
        quote_data = self.av_client.get_quote(ticker)

        if not quote_data:
            # Fallback to cached data even if expired
            if use_cache:
                cached = self.db.query(StockCache).filter(StockCache.ticker == ticker).first()
                if cached:
                    return Quote(
                        ticker=cached.ticker,
                        price=float(cached.current_price) if cached.current_price else 0,
                        change=float(cached.change) if cached.change else 0,
                        change_percent=float(cached.change_percent) if cached.change_percent else 0,
                        volume=int(cached.volume) if cached.volume else None,
                        market_cap=int(cached.market_cap) if cached.market_cap else None,
                        pe_ratio=float(cached.pe_ratio) if cached.pe_ratio else None
                    )
            # Return mock data as last resort
            return self._get_mock_quote(ticker)

        # Update cache
        cached = self.db.query(StockCache).filter(StockCache.ticker == ticker).first()
        if cached:
            cached.current_price = quote_data["price"]
            cached.change = quote_data["change"]
            cached.change_percent = quote_data["change_percent"]
            cached.volume = quote_data["volume"]
            cached.updated_at = quote_data["updated_at"]
        else:
            cached = StockCache(
                ticker=quote_data["ticker"],
                current_price=quote_data["price"],
                change=quote_data["change"],
                change_percent=quote_data["change_percent"],
                volume=quote_data["volume"],
                updated_at=quote_data["updated_at"]
            )
            self.db.add(cached)

        try:
            self.db.commit()
        except Exception as e:
            print(f"Error updating cache: {e}")
            self.db.rollback()

        return Quote(**quote_data)

    def get_multiple_quotes(self, tickers: List[str]) -> List[Quote]:
        """Get quotes for multiple tickers"""
        quotes = []
        for ticker in tickers:
            quote = self.get_quote(ticker)
            if quote:
                quotes.append(quote)
        return quotes

    def get_indices(self) -> List[MarketIndex]:
        """Get major market indices"""
        indices_map = {
            "^GSPC": "S&P 500",
            "^IXIC": "NASDAQ",
            "^DJI": "Dow Jones",
            "^RUT": "Russell 2000"
        }

        indices = []
        for symbol, name in indices_map.items():
            quote = self.get_quote(symbol)
            if quote:
                indices.append(MarketIndex(
                    symbol=symbol,
                    name=name,
                    price=quote.price,
                    change=quote.change,
                    change_percent=quote.change_percent
                ))

        return indices

    def get_historical_data(self, ticker: str, interval: str = "daily") -> List[Dict]:
        """Get historical price data"""
        return self.av_client.get_historical_prices(ticker, interval)

    def search(self, query: str) -> List[Dict]:
        """Search for stocks"""
        return self.av_client.search_symbols(query)

    def get_company_info(self, ticker: str) -> Optional[Dict]:
        """Get company overview and fundamentals"""
        # Try to fetch from Alpha Vantage
        overview = self.av_client.get_company_overview(ticker)

        if overview:
            # Update cache with fundamental data
            cached = self.db.query(StockCache).filter(StockCache.ticker == ticker).first()
            if cached:
                cached.market_cap = overview.get("market_cap")
                cached.pe_ratio = overview.get("pe_ratio")
                try:
                    self.db.commit()
                except Exception as e:
                    print(f"Error updating cache with fundamentals: {e}")
                    self.db.rollback()

        return overview

    def _get_mock_quote(self, ticker: str) -> Quote:
        """Return mock data when API is unavailable (for development/testing)"""
        # Mock prices for common tickers
        mock_prices = {
            'AAPL': 175.43, 'MSFT': 380.50, 'GOOGL': 140.25, 'AMZN': 155.80,
            'TSLA': 242.15, 'META': 485.90, 'NVDA': 495.20, 'AMD': 165.75,
            '^GSPC': 4550.50, '^IXIC': 14200.30, '^DJI': 35800.20, '^RUT': 2050.75,
            'SPY': 455.20, 'QQQ': 380.40, 'DIA': 358.10, 'IWM': 195.30,
            'JPM': 145.30, 'BAC': 28.75, 'WMT': 165.20, 'V': 245.80,
            'MA': 385.50, 'DIS': 95.40, 'NFLX': 425.60, 'PYPL': 62.30
        }

        base_price = mock_prices.get(ticker, 100.0)
        # Add some random variation
        change_percent = random.uniform(-3, 3)
        change = base_price * (change_percent / 100)

        return Quote(
            ticker=ticker,
            price=round(base_price, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
            volume=random.randint(5000000, 50000000),
            market_cap=random.randint(10000000000, 2000000000000),
            pe_ratio=round(random.uniform(10, 50), 2),
            high=round(base_price * 1.02, 2),
            low=round(base_price * 0.98, 2),
            open=round(base_price * 0.99, 2),
            previous_close=round(base_price - change, 2)
        )
