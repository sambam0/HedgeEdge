from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date, datetime
from decimal import Decimal


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
    created_at: datetime
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
    volume: Optional[int] = None
    market_cap: Optional[int] = None
    pe_ratio: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    open: Optional[float] = None
    previous_close: Optional[float] = None


class MarketIndex(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float


class IndexData(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float


class ChartData(BaseModel):
    timestamp: List[str]
    open: List[float]
    high: List[float]
    low: List[float]
    close: List[float]
    volume: List[int]


# Portfolio Performance Schemas
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


class PositionWithLiveData(BaseModel):
    id: int
    ticker: str
    shares: float
    cost_basis: float
    purchase_date: date
    current_price: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float
    daily_change: float
    daily_change_percent: float


# Screener Schemas
class StockScreenerFilters(BaseModel):
    min_market_cap: Optional[float] = None
    max_market_cap: Optional[float] = None
    min_pe: Optional[float] = None
    max_pe: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sector: Optional[str] = None


class ScreenerFilters(BaseModel):
    min_market_cap: Optional[float] = None
    max_market_cap: Optional[float] = None
    min_pe: Optional[float] = None
    max_pe: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sectors: Optional[List[str]] = None


class ScreenerResult(BaseModel):
    ticker: str
    name: str
    price: float
    change_percent: float
    market_cap: Optional[int] = None
    pe_ratio: Optional[float] = None
    volume: int = 0
    sector: Optional[str] = None


# Macro Schemas
class EconomicIndicatorData(BaseModel):
    indicator_name: str
    value: float
    date: date


class YieldCurveData(BaseModel):
    maturity: str
    yield_value: float
    date: date


# News Schemas
class NewsArticle(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    source: Optional[str] = None
    published_at: str
    image_url: Optional[str] = None
    author: Optional[str] = None
    sentiment: str  # "positive", "neutral", or "negative"
    tickers: List[str] = []


class NewsPagination(BaseModel):
    articles: List[NewsArticle]
    total_results: int
    page: int


class MarketSentiment(BaseModel):
    score: float  # 0-100
    distribution: Dict[str, int]  # {positive: x, neutral: y, negative: z}
    total_articles: int
