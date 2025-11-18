from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, BigInteger, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    positions = relationship("Position", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")
    snapshots = relationship("PortfolioSnapshot", back_populates="portfolio", cascade="all, delete-orphan")


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String(10), nullable=False)
    shares = Column(Numeric(15, 4), nullable=False)
    cost_basis = Column(Numeric(15, 2), nullable=False)
    purchase_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="positions")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String(10), nullable=False)
    transaction_type = Column(String(10), nullable=False)  # 'BUY' or 'SELL'
    shares = Column(Numeric(15, 4), nullable=False)
    price = Column(Numeric(15, 2), nullable=False)
    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="transactions")


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    total_value = Column(Numeric(15, 2), nullable=False)
    daily_return = Column(Numeric(10, 4))
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="snapshots")


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    stocks = relationship("WatchlistStock", back_populates="watchlist", cascade="all, delete-orphan")


class WatchlistStock(Base):
    __tablename__ = "watchlist_stocks"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id"), nullable=False)
    ticker = Column(String(10), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    watchlist = relationship("Watchlist", back_populates="stocks")


class StockCache(Base):
    __tablename__ = "stock_cache"

    ticker = Column(String(10), primary_key=True, index=True)
    current_price = Column(Numeric(15, 2))
    change = Column(Numeric(15, 2))
    change_percent = Column(Numeric(10, 4))
    volume = Column(BigInteger)
    market_cap = Column(BigInteger)
    pe_ratio = Column(Numeric(10, 2))
    updated_at = Column(DateTime, default=datetime.utcnow)


class EconomicIndicator(Base):
    __tablename__ = "economic_indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator_name = Column(String(100), nullable=False)
    value = Column(Numeric(15, 4), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
