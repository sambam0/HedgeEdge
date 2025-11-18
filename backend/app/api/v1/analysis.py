from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.services.analysis_service import AnalysisService

router = APIRouter()


@router.get("/correlation")
def get_correlation_matrix(
    tickers: str = Query(..., description="Comma-separated list of tickers"),
    period: str = Query("6M", description="Time period: 1M, 3M, 6M, 1Y"),
    db: Session = Depends(get_db)
):
    """Get correlation matrix for a list of tickers"""
    ticker_list = [t.strip().upper() for t in tickers.split(",")]

    if len(ticker_list) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 tickers required for correlation matrix"
        )

    analysis_service = AnalysisService(db)
    result = analysis_service.calculate_correlation_matrix(ticker_list, period)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result


@router.get("/portfolio/{portfolio_id}/risk")
def get_portfolio_risk_metrics(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive risk metrics for a portfolio"""
    analysis_service = AnalysisService(db)
    result = analysis_service.calculate_portfolio_risk_metrics(portfolio_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.get("/portfolio/{portfolio_id}/attribution")
def get_performance_attribution(
    portfolio_id: int,
    period: str = Query("1Y", description="Time period: 1M, 3M, 6M, 1Y"),
    db: Session = Depends(get_db)
):
    """Get performance attribution by sector and position"""
    analysis_service = AnalysisService(db)
    result = analysis_service.calculate_performance_attribution(portfolio_id, period)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.get("/portfolio/{portfolio_id}/benchmark")
def compare_to_benchmark(
    portfolio_id: int,
    benchmark: str = Query("^GSPC", description="Benchmark ticker (default: S&P 500)"),
    period: str = Query("1Y", description="Time period: 1M, 3M, 6M, 1Y"),
    db: Session = Depends(get_db)
):
    """Compare portfolio performance to benchmark"""
    analysis_service = AnalysisService(db)
    result = analysis_service.compare_to_benchmark(portfolio_id, benchmark, period)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.get("/portfolio/{portfolio_id}/diversification")
def get_diversification_metrics(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """Get diversification score and metrics"""
    analysis_service = AnalysisService(db)
    result = analysis_service.calculate_diversification_score(portfolio_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result
