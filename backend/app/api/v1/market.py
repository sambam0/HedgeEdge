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


@router.get("/intraday/{ticker}")
def get_intraday_data(ticker: str, interval: str = "5min"):
    """Get intraday price data for detailed charts"""
    valid_intervals = ["1min", "5min", "15min", "30min", "60min"]
    if interval not in valid_intervals:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Must be one of: {valid_intervals}")

    data = market_service.get_intraday_data(ticker.upper(), interval)
    return {
        "ticker": ticker.upper(),
        "interval": interval,
        "data": data
    }


@router.get("/company/{ticker}")
def get_company_overview(ticker: str):
    """Get detailed company information and fundamentals"""
    overview = market_service.get_company_overview(ticker.upper())
    if not overview:
        raise HTTPException(status_code=404, detail=f"Company information not found for {ticker}")
    return overview


@router.get("/technical/{ticker}")
def get_technical_indicators(ticker: str, indicators: str = "SMA,RSI,MACD"):
    """Get calculated technical indicators"""
    indicator_list = [ind.strip() for ind in indicators.split(",")]
    valid_indicators = ["SMA", "RSI", "MACD"]

    # Validate indicators
    for ind in indicator_list:
        if ind not in valid_indicators:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid indicator '{ind}'. Must be one of: {valid_indicators}"
            )

    data = market_service.calculate_technical_indicators(ticker.upper(), indicator_list)
    return {
        "ticker": ticker.upper(),
        "indicators": data
    }
