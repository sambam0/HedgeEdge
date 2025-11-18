# Workstream 1: Backend API & Database

**Agent Focus:** Backend infrastructure, database models, and API implementations

**Estimated Time:** 5-7 days

**Priority:** HIGH (Blocking for frontend development)

---

## Overview

Build the complete backend infrastructure including:
- Database models and migrations
- Market data service with API integrations
- Portfolio service with real-time calculations
- Screener service with filtering
- Macro service with FRED integration
- Background jobs for data updates

---

## Task Breakdown

### 1. Database Setup & Models (Day 1)

#### 1.1 Set up database configuration
**File:** `backend/app/db/base.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 1.2 Create Portfolio models
**File:** `backend/app/models/models.py`

```python
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    positions = relationship("Position", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")
    snapshots = relationship("PortfolioSnapshot", back_populates="portfolio", cascade="all, delete-orphan")

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False, index=True)
    shares = Column(Float, nullable=False)
    cost_basis = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="positions")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False, index=True)
    transaction_type = Column(String, nullable=False)  # 'BUY' or 'SELL'
    shares = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="transactions")

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    total_value = Column(Float, nullable=False)
    daily_return = Column(Float)
    sp500_return = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="snapshots")
```

#### 1.3 Create Watchlist models
**File:** `backend/app/models/models.py` (add to existing)

```python
class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    stocks = relationship("WatchlistStock", back_populates="watchlist", cascade="all, delete-orphan")

class WatchlistStock(Base):
    __tablename__ = "watchlist_stocks"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id"), nullable=False)
    ticker = Column(String, nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    watchlist = relationship("Watchlist", back_populates="stocks")
```

#### 1.4 Create cache models
**File:** `backend/app/models/models.py` (add to existing)

```python
class StockCache(Base):
    __tablename__ = "stock_cache"

    ticker = Column(String, primary_key=True, index=True)
    current_price = Column(Float)
    change = Column(Float)
    change_percent = Column(Float)
    volume = Column(Integer)
    market_cap = Column(Integer)
    pe_ratio = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)

class EconomicIndicator(Base):
    __tablename__ = "economic_indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator_name = Column(String, nullable=False, index=True)
    value = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 1.5 Create Pydantic schemas
**File:** `backend/app/models/schemas.py`

```python
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

# Portfolio Schemas
class PositionBase(BaseModel):
    ticker: str
    shares: float
    cost_basis: float
    purchase_date: date

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    shares: Optional[float] = None
    cost_basis: Optional[float] = None

class Position(PositionBase):
    id: int
    portfolio_id: int
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    name: str

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    created_at: datetime
    positions: List[Position] = []

    class Config:
        from_attributes = True

class PortfolioPerformance(BaseModel):
    total_value: float
    total_cost: float
    total_gain_loss: float
    total_gain_loss_percent: float
    daily_change: float
    daily_change_percent: float
    positions_count: int
    sp500_return: Optional[float] = None
    vs_sp500: Optional[float] = None

# Transaction Schemas
class TransactionBase(BaseModel):
    ticker: str
    transaction_type: str
    shares: float
    price: float
    transaction_date: date

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    portfolio_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Watchlist Schemas
class WatchlistStockBase(BaseModel):
    ticker: str

class WatchlistStockCreate(WatchlistStockBase):
    pass

class WatchlistStock(WatchlistStockBase):
    id: int
    watchlist_id: int
    added_at: datetime
    current_price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None

    class Config:
        from_attributes = True

class WatchlistBase(BaseModel):
    name: str

class WatchlistCreate(WatchlistBase):
    pass

class Watchlist(WatchlistBase):
    id: int
    created_at: datetime
    stocks: List[WatchlistStock] = []

    class Config:
        from_attributes = True

# Market Data Schemas
class Quote(BaseModel):
    ticker: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[int] = None
    pe_ratio: Optional[float] = None
    updated_at: datetime

class MarketIndex(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float

class StockScreenerFilters(BaseModel):
    min_market_cap: Optional[float] = None
    max_market_cap: Optional[float] = None
    min_pe: Optional[float] = None
    max_pe: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sector: Optional[str] = None

class ScreenerResult(BaseModel):
    ticker: str
    name: str
    price: float
    market_cap: float
    pe_ratio: Optional[float] = None
    change_percent: float
    volume: int

# Macro Schemas
class EconomicIndicatorData(BaseModel):
    indicator_name: str
    value: float
    date: date

class YieldCurveData(BaseModel):
    maturity: str
    yield_value: float
    date: date
```

#### 1.6 Run database migrations
**File:** `backend/app/db/init_db.py`

```python
from app.db.base import Base, engine
from app.models import models

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def seed_db():
    """Seed database with sample data"""
    from app.db.base import SessionLocal
    from app.models.models import Portfolio, Watchlist

    db = SessionLocal()

    # Create default portfolio
    portfolio = Portfolio(name="Main Portfolio")
    db.add(portfolio)

    # Create default watchlist
    watchlist = Watchlist(name="My Watchlist")
    db.add(watchlist)

    db.commit()
    db.close()

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Seeding database...")
    seed_db()
    print("Done!")
```

**Run:** `python -m app.db.init_db`

---

### 2. Market Data Service (Day 2)

#### 2.1 Create Alpha Vantage client
**File:** `backend/app/services/alpha_vantage.py`

```python
import requests
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from app.core.config import settings

class AlphaVantageClient:
    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.session = requests.Session()

    def get_quote(self, ticker: str) -> Optional[Dict]:
        """Get real-time quote for a ticker"""
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker,
            "apikey": self.api_key
        }

        response = self.session.get(self.BASE_URL, params=params)
        data = response.json()

        if "Global Quote" not in data:
            return None

        quote = data["Global Quote"]

        return {
            "ticker": ticker,
            "price": float(quote.get("05. price", 0)),
            "change": float(quote.get("09. change", 0)),
            "change_percent": float(quote.get("10. change percent", "0").strip("%")),
            "volume": int(quote.get("06. volume", 0)),
            "updated_at": datetime.utcnow()
        }

    def get_historical_prices(self, ticker: str, interval: str = "daily") -> List[Dict]:
        """Get historical price data"""
        function_map = {
            "daily": "TIME_SERIES_DAILY",
            "weekly": "TIME_SERIES_WEEKLY",
            "monthly": "TIME_SERIES_MONTHLY"
        }

        params = {
            "function": function_map.get(interval, "TIME_SERIES_DAILY"),
            "symbol": ticker,
            "outputsize": "full",
            "apikey": self.api_key
        }

        response = self.session.get(self.BASE_URL, params=params)
        data = response.json()

        # Parse time series data
        time_series_key = f"Time Series ({interval.capitalize()})"
        if time_series_key not in data:
            return []

        prices = []
        for date_str, values in data[time_series_key].items():
            prices.append({
                "date": datetime.strptime(date_str, "%Y-%m-%d"),
                "open": float(values["1. open"]),
                "high": float(values["2. high"]),
                "low": float(values["3. low"]),
                "close": float(values["4. close"]),
                "volume": int(values["5. volume"])
            })

        return sorted(prices, key=lambda x: x["date"])

    def search_symbols(self, keywords: str) -> List[Dict]:
        """Search for stock symbols"""
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": keywords,
            "apikey": self.api_key
        }

        response = self.session.get(self.BASE_URL, params=params)
        data = response.json()

        if "bestMatches" not in data:
            return []

        return [
            {
                "ticker": match["1. symbol"],
                "name": match["2. name"],
                "type": match["3. type"],
                "region": match["4. region"]
            }
            for match in data["bestMatches"]
        ]
```

#### 2.2 Implement Market Service with caching
**File:** `backend/app/services/market_service.py`

```python
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.services.alpha_vantage import AlphaVantageClient
from app.models.models import StockCache
from app.models.schemas import Quote, MarketIndex

class MarketService:
    def __init__(self, db: Session):
        self.db = db
        self.av_client = AlphaVantageClient()
        self.cache_ttl = timedelta(minutes=15)  # 15 minute cache

    def get_quote(self, ticker: str, use_cache: bool = True) -> Optional[Quote]:
        """Get quote with caching"""
        # Check cache first
        if use_cache:
            cached = self.db.query(StockCache).filter(StockCache.ticker == ticker).first()
            if cached and (datetime.utcnow() - cached.updated_at) < self.cache_ttl:
                return Quote(
                    ticker=cached.ticker,
                    price=cached.current_price,
                    change=cached.change,
                    change_percent=cached.change_percent,
                    volume=cached.volume or 0,
                    market_cap=cached.market_cap,
                    pe_ratio=cached.pe_ratio,
                    updated_at=cached.updated_at
                )

        # Fetch fresh data
        quote_data = self.av_client.get_quote(ticker)
        if not quote_data:
            return None

        # Update cache
        cached = self.db.query(StockCache).filter(StockCache.ticker == ticker).first()
        if cached:
            cached.current_price = quote_data["price"]
            cached.change = quote_data["change"]
            cached.change_percent = quote_data["change_percent"]
            cached.volume = quote_data["volume"]
            cached.updated_at = quote_data["updated_at"]
        else:
            cached = StockCache(**quote_data)
            self.db.add(cached)

        self.db.commit()

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
            "SPY": "S&P 500",
            "QQQ": "NASDAQ",
            "DIA": "Dow Jones",
            "IWM": "Russell 2000"
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
```

#### 2.3 Create market API endpoints
**File:** `backend/app/api/v1/market.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.services.market_service import MarketService
from app.models.schemas import Quote, MarketIndex

router = APIRouter()

@router.get("/indices", response_model=List[MarketIndex])
async def get_indices(db: Session = Depends(get_db)):
    """Get major market indices"""
    service = MarketService(db)
    return service.get_indices()

@router.get("/quote/{ticker}", response_model=Quote)
async def get_quote(ticker: str, db: Session = Depends(get_db)):
    """Get real-time quote for a ticker"""
    service = MarketService(db)
    quote = service.get_quote(ticker.upper())

    if not quote:
        raise HTTPException(status_code=404, detail=f"Quote not found for {ticker}")

    return quote

@router.get("/chart/{ticker}")
async def get_chart_data(
    ticker: str,
    interval: str = "daily",
    db: Session = Depends(get_db)
):
    """Get historical price data for charts"""
    service = MarketService(db)
    data = service.get_historical_data(ticker.upper(), interval)

    if not data:
        raise HTTPException(status_code=404, detail=f"Chart data not found for {ticker}")

    return {"ticker": ticker, "interval": interval, "data": data}

@router.get("/search")
async def search_stocks(q: str, db: Session = Depends(get_db)):
    """Search for stocks by symbol or name"""
    service = MarketService(db)
    results = service.search(q)
    return {"query": q, "results": results}
```

---

### 3. Portfolio Service (Day 3-4)

#### 3.1 Implement Portfolio Service
**File:** `backend/app/services/portfolio_service.py`

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app.models.models import Portfolio, Position, Transaction, PortfolioSnapshot
from app.models.schemas import (
    PortfolioCreate, PositionCreate, PositionUpdate, TransactionCreate,
    PortfolioPerformance
)
from app.services.market_service import MarketService

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db
        self.market_service = MarketService(db)

    # Portfolio CRUD
    def create_portfolio(self, portfolio: PortfolioCreate) -> Portfolio:
        """Create a new portfolio"""
        db_portfolio = Portfolio(name=portfolio.name)
        self.db.add(db_portfolio)
        self.db.commit()
        self.db.refresh(db_portfolio)
        return db_portfolio

    def get_portfolio(self, portfolio_id: int) -> Optional[Portfolio]:
        """Get portfolio by ID"""
        return self.db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()

    def get_all_portfolios(self) -> List[Portfolio]:
        """Get all portfolios"""
        return self.db.query(Portfolio).all()

    # Position CRUD
    def add_position(self, portfolio_id: int, position: PositionCreate) -> Position:
        """Add a position to portfolio"""
        db_position = Position(
            portfolio_id=portfolio_id,
            ticker=position.ticker.upper(),
            shares=position.shares,
            cost_basis=position.cost_basis,
            purchase_date=position.purchase_date
        )
        self.db.add(db_position)

        # Also add transaction
        transaction = Transaction(
            portfolio_id=portfolio_id,
            ticker=position.ticker.upper(),
            transaction_type="BUY",
            shares=position.shares,
            price=position.cost_basis,
            transaction_date=position.purchase_date
        )
        self.db.add(transaction)

        self.db.commit()
        self.db.refresh(db_position)
        return db_position

    def update_position(self, position_id: int, position_update: PositionUpdate) -> Position:
        """Update a position"""
        db_position = self.db.query(Position).filter(Position.id == position_id).first()
        if not db_position:
            return None

        if position_update.shares is not None:
            db_position.shares = position_update.shares
        if position_update.cost_basis is not None:
            db_position.cost_basis = position_update.cost_basis

        self.db.commit()
        self.db.refresh(db_position)
        return db_position

    def delete_position(self, position_id: int) -> bool:
        """Delete a position"""
        db_position = self.db.query(Position).filter(Position.id == position_id).first()
        if not db_position:
            return False

        self.db.delete(db_position)
        self.db.commit()
        return True

    def get_positions(self, portfolio_id: int) -> List[Position]:
        """Get all positions for a portfolio with current prices"""
        positions = self.db.query(Position).filter(
            Position.portfolio_id == portfolio_id
        ).all()

        # Enrich with current prices
        for position in positions:
            quote = self.market_service.get_quote(position.ticker)
            if quote:
                position.current_price = quote.price
                position.current_value = quote.price * position.shares
                position.profit_loss = position.current_value - (position.cost_basis * position.shares)
                position.profit_loss_percent = (position.profit_loss / (position.cost_basis * position.shares)) * 100

        return positions

    # Performance Calculations
    def get_performance(self, portfolio_id: int) -> PortfolioPerformance:
        """Calculate portfolio performance metrics"""
        positions = self.get_positions(portfolio_id)

        total_value = 0
        total_cost = 0

        for position in positions:
            total_value += position.current_value or 0
            total_cost += position.cost_basis * position.shares

        total_gain_loss = total_value - total_cost
        total_gain_loss_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0

        # Calculate daily change
        daily_change = self._calculate_daily_change(portfolio_id)
        daily_change_percent = (daily_change / (total_value - daily_change) * 100) if total_value > 0 else 0

        # Get S&P 500 return
        sp500_return = self._get_sp500_return(portfolio_id)
        vs_sp500 = total_gain_loss_percent - sp500_return if sp500_return else None

        return PortfolioPerformance(
            total_value=total_value,
            total_cost=total_cost,
            total_gain_loss=total_gain_loss,
            total_gain_loss_percent=total_gain_loss_percent,
            daily_change=daily_change,
            daily_change_percent=daily_change_percent,
            positions_count=len(positions),
            sp500_return=sp500_return,
            vs_sp500=vs_sp500
        )

    def _calculate_daily_change(self, portfolio_id: int) -> float:
        """Calculate daily change in portfolio value"""
        # Get yesterday's snapshot
        yesterday = date.today()
        snapshot = self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.portfolio_id == portfolio_id,
            PortfolioSnapshot.snapshot_date == yesterday
        ).first()

        if not snapshot:
            return 0

        # Calculate current value
        positions = self.get_positions(portfolio_id)
        current_value = sum(p.current_value or 0 for p in positions)

        return current_value - snapshot.total_value

    def _get_sp500_return(self, portfolio_id: int) -> Optional[float]:
        """Get S&P 500 return for comparison"""
        # Get portfolio start date (earliest purchase)
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio or not portfolio.positions:
            return None

        # For now, return a simple benchmark (can be enhanced later)
        return 10.0  # Placeholder: 10% annual return

    def create_daily_snapshot(self, portfolio_id: int):
        """Create a daily snapshot of portfolio value"""
        positions = self.get_positions(portfolio_id)
        total_value = sum(p.current_value or 0 for p in positions)

        snapshot = PortfolioSnapshot(
            portfolio_id=portfolio_id,
            snapshot_date=date.today(),
            total_value=total_value,
            daily_return=0,  # Calculate based on previous snapshot
            sp500_return=0   # Fetch actual S&P 500 return
        )

        self.db.add(snapshot)
        self.db.commit()
```

#### 3.2 Create portfolio API endpoints
**File:** `backend/app/api/v1/portfolio.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.services.portfolio_service import PortfolioService
from app.models.schemas import (
    Portfolio, PortfolioCreate, Position, PositionCreate, PositionUpdate,
    PortfolioPerformance, Transaction
)

router = APIRouter()

@router.get("", response_model=List[Portfolio])
async def get_portfolios(db: Session = Depends(get_db)):
    """Get all portfolios"""
    service = PortfolioService(db)
    return service.get_all_portfolios()

@router.post("", response_model=Portfolio)
async def create_portfolio(portfolio: PortfolioCreate, db: Session = Depends(get_db)):
    """Create a new portfolio"""
    service = PortfolioService(db)
    return service.create_portfolio(portfolio)

@router.get("/{portfolio_id}", response_model=Portfolio)
async def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Get a specific portfolio"""
    service = PortfolioService(db)
    portfolio = service.get_portfolio(portfolio_id)

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return portfolio

@router.get("/{portfolio_id}/positions", response_model=List[Position])
async def get_positions(portfolio_id: int, db: Session = Depends(get_db)):
    """Get all positions in a portfolio"""
    service = PortfolioService(db)
    return service.get_positions(portfolio_id)

@router.post("/{portfolio_id}/positions", response_model=Position)
async def add_position(
    portfolio_id: int,
    position: PositionCreate,
    db: Session = Depends(get_db)
):
    """Add a position to portfolio"""
    service = PortfolioService(db)
    return service.add_position(portfolio_id, position)

@router.put("/positions/{position_id}", response_model=Position)
async def update_position(
    position_id: int,
    position_update: PositionUpdate,
    db: Session = Depends(get_db)
):
    """Update a position"""
    service = PortfolioService(db)
    position = service.update_position(position_id, position_update)

    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    return position

@router.delete("/positions/{position_id}")
async def delete_position(position_id: int, db: Session = Depends(get_db)):
    """Delete a position"""
    service = PortfolioService(db)
    success = service.delete_position(position_id)

    if not success:
        raise HTTPException(status_code=404, detail="Position not found")

    return {"success": True}

@router.get("/{portfolio_id}/performance", response_model=PortfolioPerformance)
async def get_performance(portfolio_id: int, db: Session = Depends(get_db)):
    """Get portfolio performance metrics"""
    service = PortfolioService(db)
    return service.get_performance(portfolio_id)
```

---

### 4. Screener Service (Day 5)

#### 4.1 Implement Screener Service
**File:** `backend/app/services/screener_service.py`

```python
from sqlalchemy.orm import Session
from typing import List
from app.models.schemas import StockScreenerFilters, ScreenerResult
from app.models.models import StockCache

class ScreenerService:
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

        results = query.all()

        # Convert to ScreenerResult
        return [
            ScreenerResult(
                ticker=stock.ticker,
                name=stock.ticker,  # TODO: Add company name to cache
                price=stock.current_price,
                market_cap=stock.market_cap or 0,
                pe_ratio=stock.pe_ratio,
                change_percent=stock.change_percent,
                volume=stock.volume or 0
            )
            for stock in results
        ]
```

#### 4.2 Create screener API endpoint
**File:** `backend/app/api/v1/screener.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.services.screener_service import ScreenerService
from app.models.schemas import StockScreenerFilters, ScreenerResult

router = APIRouter()

@router.post("", response_model=List[ScreenerResult])
async def screen_stocks(filters: StockScreenerFilters, db: Session = Depends(get_db)):
    """Screen stocks based on filters"""
    service = ScreenerService(db)
    return service.screen_stocks(filters)
```

---

### 5. Macro Service (Day 6)

#### 5.1 Create FRED API client
**File:** `backend/app/services/fred_client.py`

```python
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.core.config import settings

class FREDClient:
    BASE_URL = "https://api.stlouisfed.org/fred"

    def __init__(self):
        self.api_key = settings.FRED_API_KEY

    def get_series(self, series_id: str, limit: int = 100) -> List[Dict]:
        """Get economic data series"""
        url = f"{self.BASE_URL}/series/observations"
        params = {
            "series_id": series_id,
            "api_key": self.api_key,
            "file_type": "json",
            "limit": limit,
            "sort_order": "desc"
        }

        response = requests.get(url, params=params)
        data = response.json()

        if "observations" not in data:
            return []

        observations = []
        for obs in data["observations"]:
            if obs["value"] != ".":
                observations.append({
                    "date": datetime.strptime(obs["date"], "%Y-%m-%d").date(),
                    "value": float(obs["value"])
                })

        return observations

    def get_latest_value(self, series_id: str) -> Optional[float]:
        """Get the latest value for a series"""
        data = self.get_series(series_id, limit=1)
        return data[0]["value"] if data else None
```

#### 5.2 Implement Macro Service
**File:** `backend/app/services/macro_service.py`

```python
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime
from app.services.fred_client import FREDClient
from app.models.models import EconomicIndicator
from app.models.schemas import EconomicIndicatorData, YieldCurveData

class MacroService:
    # FRED Series IDs
    SERIES_IDS = {
        "fed_funds_rate": "FEDFUNDS",
        "cpi": "CPIAUCSL",
        "unemployment": "UNRATE",
        "gdp": "GDP",
        "treasury_3m": "DGS3MO",
        "treasury_2y": "DGS2",
        "treasury_5y": "DGS5",
        "treasury_10y": "DGS10",
        "treasury_30y": "DGS30"
    }

    def __init__(self, db: Session):
        self.db = db
        self.fred_client = FREDClient()

    def get_indicator(self, indicator_name: str) -> List[EconomicIndicatorData]:
        """Get economic indicator data"""
        series_id = self.SERIES_IDS.get(indicator_name)
        if not series_id:
            return []

        data = self.fred_client.get_series(series_id)

        return [
            EconomicIndicatorData(
                indicator_name=indicator_name,
                value=obs["value"],
                date=obs["date"]
            )
            for obs in data
        ]

    def get_all_indicators(self) -> Dict[str, float]:
        """Get latest values for all indicators"""
        indicators = {}

        for name, series_id in self.SERIES_IDS.items():
            value = self.fred_client.get_latest_value(series_id)
            if value is not None:
                indicators[name] = value

        return indicators

    def get_yield_curve(self) -> List[YieldCurveData]:
        """Get current treasury yield curve"""
        maturities = {
            "3M": "treasury_3m",
            "2Y": "treasury_2y",
            "5Y": "treasury_5y",
            "10Y": "treasury_10y",
            "30Y": "treasury_30y"
        }

        yield_curve = []

        for maturity, indicator_name in maturities.items():
            data = self.get_indicator(indicator_name)
            if data:
                latest = data[0]
                yield_curve.append(YieldCurveData(
                    maturity=maturity,
                    yield_value=latest.value,
                    date=latest.date
                ))

        return yield_curve

    def update_cache(self):
        """Update cached economic indicators"""
        for name, series_id in self.SERIES_IDS.items():
            data = self.fred_client.get_series(series_id, limit=10)

            for obs in data:
                indicator = EconomicIndicator(
                    indicator_name=name,
                    value=obs["value"],
                    date=obs["date"]
                )
                self.db.add(indicator)

        self.db.commit()
```

#### 5.3 Create macro API endpoints
**File:** `backend/app/api/v1/macro.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, List
from app.db.base import get_db
from app.services.macro_service import MacroService
from app.models.schemas import EconomicIndicatorData, YieldCurveData

router = APIRouter()

@router.get("/indicators", response_model=Dict[str, float])
async def get_indicators(db: Session = Depends(get_db)):
    """Get all macro indicators"""
    service = MacroService(db)
    return service.get_all_indicators()

@router.get("/indicator/{name}", response_model=List[EconomicIndicatorData])
async def get_indicator(name: str, db: Session = Depends(get_db)):
    """Get specific indicator data"""
    service = MacroService(db)
    return service.get_indicator(name)

@router.get("/yield-curve", response_model=List[YieldCurveData])
async def get_yield_curve(db: Session = Depends(get_db)):
    """Get treasury yield curve"""
    service = MacroService(db)
    return service.get_yield_curve()
```

---

### 6. Watchlist Service (Day 6)

#### 6.1 Implement Watchlist Service
**File:** `backend/app/services/watchlist_service.py`

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.models import Watchlist, WatchlistStock
from app.models.schemas import WatchlistCreate, WatchlistStockCreate
from app.services.market_service import MarketService

class WatchlistService:
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

    def add_stock(self, watchlist_id: int, stock: WatchlistStockCreate) -> WatchlistStock:
        """Add stock to watchlist"""
        db_stock = WatchlistStock(
            watchlist_id=watchlist_id,
            ticker=stock.ticker.upper()
        )
        self.db.add(db_stock)
        self.db.commit()
        self.db.refresh(db_stock)
        return db_stock

    def remove_stock(self, stock_id: int) -> bool:
        """Remove stock from watchlist"""
        stock = self.db.query(WatchlistStock).filter(WatchlistStock.id == stock_id).first()
        if not stock:
            return False

        self.db.delete(stock)
        self.db.commit()
        return True
```

#### 6.2 Create watchlist API endpoints
**File:** `backend/app/api/v1/watchlist.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.services.watchlist_service import WatchlistService
from app.models.schemas import Watchlist, WatchlistCreate, WatchlistStock, WatchlistStockCreate

router = APIRouter()

@router.get("/{watchlist_id}", response_model=Watchlist)
async def get_watchlist(watchlist_id: int, db: Session = Depends(get_db)):
    """Get watchlist with live prices"""
    service = WatchlistService(db)
    watchlist = service.get_watchlist(watchlist_id)

    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")

    return watchlist

@router.post("", response_model=Watchlist)
async def create_watchlist(watchlist: WatchlistCreate, db: Session = Depends(get_db)):
    """Create a new watchlist"""
    service = WatchlistService(db)
    return service.create_watchlist(watchlist)

@router.post("/{watchlist_id}/stocks", response_model=WatchlistStock)
async def add_stock(
    watchlist_id: int,
    stock: WatchlistStockCreate,
    db: Session = Depends(get_db)
):
    """Add stock to watchlist"""
    service = WatchlistService(db)
    return service.add_stock(watchlist_id, stock)

@router.delete("/stocks/{stock_id}")
async def remove_stock(stock_id: int, db: Session = Depends(get_db)):
    """Remove stock from watchlist"""
    service = WatchlistService(db)
    success = service.remove_stock(stock_id)

    if not success:
        raise HTTPException(status_code=404, detail="Stock not found")

    return {"success": True}
```

---

### 7. Update main.py (Day 7)

**File:** `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import market, portfolio, screener, macro, watchlist

app = FastAPI(
    title="Principle Trading Terminal API",
    description="Backend API for personal trading terminal",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(market.router, prefix="/api/v1/market", tags=["market"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(screener.router, prefix="/api/v1/screener", tags=["screener"])
app.include_router(macro.router, prefix="/api/v1/macro", tags=["macro"])
app.include_router(watchlist.router, prefix="/api/v1/watchlist", tags=["watchlist"])

@app.get("/")
async def root():
    return {"message": "Principle Trading Terminal API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Sample data seeded
- [ ] Market data endpoints return valid data
- [ ] Portfolio CRUD operations work
- [ ] Position calculations are accurate
- [ ] Screener filters work correctly
- [ ] Macro data fetches from FRED
- [ ] Watchlist operations work
- [ ] API documentation accessible at `/docs`
- [ ] CORS configured correctly
- [ ] Error handling works properly

---

## Environment Variables

**File:** `backend/.env`

```env
DATABASE_URL=sqlite:///./principle.db
ALPHA_VANTAGE_API_KEY=your_key_here
FRED_API_KEY=your_key_here
FMP_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

---

## Completion Criteria

✅ All database models created and migrated
✅ Market data service fetches live quotes
✅ Portfolio service calculates P/L correctly
✅ Screener service filters stocks
✅ Macro service fetches economic data
✅ All API endpoints documented and tested
✅ Backend ready for frontend integration
