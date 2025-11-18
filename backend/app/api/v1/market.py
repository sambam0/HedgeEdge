from fastapi import APIRouter, HTTPException
from typing import List
from app.services.market_service import market_service
from app.models.schemas import Quote, IndexData, ChartData

router = APIRouter()


@router.get("/indices", response_model=List[IndexData])
def get_indices():
    """Get major market indices"""
    return market_service.get_indices()


@router.get("/quote/{ticker}", response_model=Quote)
def get_quote(ticker: str):
    """Get real-time quote for a ticker"""
    quote = market_service.get_quote(ticker.upper())
    if quote.price == 0:
        raise HTTPException(status_code=404, detail=f"Quote not found for {ticker}")
    return quote


@router.post("/quotes", response_model=List[Quote])
def get_multiple_quotes(tickers: List[str]):
    """Get quotes for multiple tickers"""
    return market_service.get_multiple_quotes([t.upper() for t in tickers])


@router.get("/chart/{ticker}")
def get_chart(ticker: str, period: str = "1M"):
    """Get historical chart data"""
    return market_service.get_chart_data(ticker.upper(), period)


@router.get("/movers")
def get_movers():
    """Get top gainers and losers"""
    return market_service.get_movers()


@router.get("/search")
def search_stocks(q: str):
    """Search for stocks"""
    if len(q) < 1:
        return []
    return market_service.search_stocks(q)
