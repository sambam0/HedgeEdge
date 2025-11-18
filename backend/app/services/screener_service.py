from sqlalchemy.orm import Session
from typing import List
from app.models.schemas import StockScreenerFilters, ScreenerResult
from app.models.models import StockCache


class ScreenerService:
    """Service for screening stocks based on filters"""

    def __init__(self, db: Session):
        self.db = db

    def screen_stocks(self, filters: StockScreenerFilters) -> List[ScreenerResult]:
        """Screen stocks based on filters"""
        query = self.db.query(StockCache)

        # Apply filters
        if filters.min_market_cap:
            query = query.filter(StockCache.market_cap >= filters.min_market_cap)
        if filters.max_market_cap:
            query = query.filter(StockCache.market_cap <= filters.max_market_cap)
        if filters.min_pe:
            query = query.filter(StockCache.pe_ratio >= filters.min_pe)
        if filters.max_pe:
            query = query.filter(StockCache.pe_ratio <= filters.max_pe)
        if filters.min_price:
            query = query.filter(StockCache.current_price >= filters.min_price)
        if filters.max_price:
            query = query.filter(StockCache.current_price <= filters.max_price)

        # Execute query
        results = query.limit(100).all()  # Limit to 100 results

        # Convert to ScreenerResult
        return [
            ScreenerResult(
                ticker=stock.ticker,
                name=stock.ticker,  # TODO: Add company name to cache
                price=float(stock.current_price) if stock.current_price else 0,
                market_cap=int(stock.market_cap) if stock.market_cap else 0,
                pe_ratio=float(stock.pe_ratio) if stock.pe_ratio else None,
                change_percent=float(stock.change_percent) if stock.change_percent else 0,
                volume=int(stock.volume) if stock.volume else 0
            )
            for stock in results
            if stock.current_price  # Only include stocks with price data
        ]

    def get_top_gainers(self, limit: int = 10) -> List[ScreenerResult]:
        """Get top gaining stocks"""
        results = self.db.query(StockCache).filter(
            StockCache.change_percent.isnot(None),
            StockCache.current_price.isnot(None)
        ).order_by(StockCache.change_percent.desc()).limit(limit).all()

        return [
            ScreenerResult(
                ticker=stock.ticker,
                name=stock.ticker,
                price=float(stock.current_price),
                market_cap=int(stock.market_cap) if stock.market_cap else 0,
                pe_ratio=float(stock.pe_ratio) if stock.pe_ratio else None,
                change_percent=float(stock.change_percent),
                volume=int(stock.volume) if stock.volume else 0
            )
            for stock in results
        ]

    def get_top_losers(self, limit: int = 10) -> List[ScreenerResult]:
        """Get top losing stocks"""
        results = self.db.query(StockCache).filter(
            StockCache.change_percent.isnot(None),
            StockCache.current_price.isnot(None)
        ).order_by(StockCache.change_percent.asc()).limit(limit).all()

        return [
            ScreenerResult(
                ticker=stock.ticker,
                name=stock.ticker,
                price=float(stock.current_price),
                market_cap=int(stock.market_cap) if stock.market_cap else 0,
                pe_ratio=float(stock.pe_ratio) if stock.pe_ratio else None,
                change_percent=float(stock.change_percent),
                volume=int(stock.volume) if stock.volume else 0
            )
            for stock in results
        ]

    def get_most_active(self, limit: int = 10) -> List[ScreenerResult]:
        """Get most actively traded stocks"""
        results = self.db.query(StockCache).filter(
            StockCache.volume.isnot(None),
            StockCache.current_price.isnot(None)
        ).order_by(StockCache.volume.desc()).limit(limit).all()

        return [
            ScreenerResult(
                ticker=stock.ticker,
                name=stock.ticker,
                price=float(stock.current_price),
                market_cap=int(stock.market_cap) if stock.market_cap else 0,
                pe_ratio=float(stock.pe_ratio) if stock.pe_ratio else None,
                change_percent=float(stock.change_percent) if stock.change_percent else 0,
                volume=int(stock.volume)
            )
            for stock in results
        ]
