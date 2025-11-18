from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime
from app.services.news_service import news_service

router = APIRouter()


@router.get("/headlines")
def get_headlines(
    category: str = Query(default="business", description="News category"),
    page_size: int = Query(default=20, le=100, description="Number of articles")
):
    """Get top financial headlines"""
    try:
        articles = news_service.get_top_headlines(category, page_size=page_size)
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
def search_news(
    q: str = Query(..., description="Search query"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: str = Query(default="publishedAt", description="Sort by: publishedAt, relevancy, popularity"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, le=100, description="Articles per page")
):
    """Search news articles with filters"""
    try:
        from_dt = datetime.fromisoformat(from_date) if from_date else None
        to_dt = datetime.fromisoformat(to_date) if to_date else None

        result = news_service.search_news(
            query=q,
            from_date=from_dt,
            to_date=to_dt,
            sort_by=sort_by,
            page=page,
            page_size=page_size
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticker/{ticker}")
def get_ticker_news(
    ticker: str,
    days_back: int = Query(default=7, ge=1, le=30, description="Days to look back")
):
    """Get news for specific ticker"""
    try:
        articles = news_service.get_ticker_news(ticker.upper(), days_back)
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment")
def get_market_sentiment():
    """Get overall market sentiment from recent news"""
    try:
        sentiment = news_service.get_market_sentiment()
        return sentiment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
