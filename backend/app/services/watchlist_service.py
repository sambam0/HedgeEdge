from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.models import Watchlist, WatchlistStock
from app.models.schemas import WatchlistCreate, WatchlistStockCreate
from app.services.market_service_db import MarketService


class WatchlistService:
    """Service for managing watchlists"""

    def __init__(self, db: Session):
        self.db = db
        self.market_service = MarketService(db)

    def create_watchlist(self, watchlist: WatchlistCreate) -> Watchlist:
        """Create a new watchlist"""
        db_watchlist = Watchlist(name=watchlist.name)
        self.db.add(db_watchlist)
        self.db.commit()
        self.db.refresh(db_watchlist)
        return db_watchlist

    def get_watchlist(self, watchlist_id: int) -> Optional[Watchlist]:
        """Get watchlist with live prices"""
        watchlist = self.db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()

        if not watchlist:
            return None

        # Enrich stocks with live prices
        for stock in watchlist.stocks:
            quote = self.market_service.get_quote(stock.ticker)
            if quote:
                stock.current_price = quote.price
                stock.change = quote.change
                stock.change_percent = quote.change_percent

        return watchlist

    def get_all_watchlists(self) -> List[Watchlist]:
        """Get all watchlists"""
        return self.db.query(Watchlist).all()

    def delete_watchlist(self, watchlist_id: int) -> bool:
        """Delete a watchlist"""
        watchlist = self.db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
        if not watchlist:
            return False

        self.db.delete(watchlist)
        self.db.commit()
        return True

    def add_stock(self, watchlist_id: int, stock: WatchlistStockCreate) -> WatchlistStock:
        """Add stock to watchlist"""
        # Check if stock already exists in watchlist
        existing = self.db.query(WatchlistStock).filter(
            WatchlistStock.watchlist_id == watchlist_id,
            WatchlistStock.ticker == stock.ticker.upper()
        ).first()

        if existing:
            return existing

        db_stock = WatchlistStock(
            watchlist_id=watchlist_id,
            ticker=stock.ticker.upper()
        )
        self.db.add(db_stock)
        self.db.commit()
        self.db.refresh(db_stock)

        # Enrich with live price
        quote = self.market_service.get_quote(db_stock.ticker)
        if quote:
            db_stock.current_price = quote.price
            db_stock.change = quote.change
            db_stock.change_percent = quote.change_percent

        return db_stock

    def remove_stock(self, stock_id: int) -> bool:
        """Remove stock from watchlist"""
        stock = self.db.query(WatchlistStock).filter(WatchlistStock.id == stock_id).first()
        if not stock:
            return False

        self.db.delete(stock)
        self.db.commit()
        return True

    def remove_stock_by_ticker(self, watchlist_id: int, ticker: str) -> bool:
        """Remove stock from watchlist by ticker"""
        stock = self.db.query(WatchlistStock).filter(
            WatchlistStock.watchlist_id == watchlist_id,
            WatchlistStock.ticker == ticker.upper()
        ).first()

        if not stock:
            return False

        self.db.delete(stock)
        self.db.commit()
        return True
