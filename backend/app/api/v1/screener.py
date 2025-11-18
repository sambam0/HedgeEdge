from fastapi import APIRouter
from app.models.schemas import ScreenerFilters
from app.services.market_service import market_service

router = APIRouter()


@router.post("/")
def run_screener(filters: ScreenerFilters):
    """Run stock screener with filters (simplified for MVP)"""
    # For MVP, return a curated list of popular stocks
    # In Phase 2, this will integrate with FMP API for full screening
    popular_stocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD',
        'JPM', 'BAC', 'WMT', 'V', 'MA', 'DIS', 'NFLX', 'PYPL',
        'KO', 'PEP', 'NKE', 'COST', 'HD', 'MCD', 'SBUX', 'TGT'
    ]

    quotes = market_service.get_multiple_quotes(popular_stocks)

    results = []
    for quote in quotes:
        # Apply basic filters
        if filters.min_price and quote.price < filters.min_price:
            continue
        if filters.max_price and quote.price > filters.max_price:
            continue
        if filters.min_pe and quote.pe_ratio and quote.pe_ratio < filters.min_pe:
            continue
        if filters.max_pe and quote.pe_ratio and quote.pe_ratio > filters.max_pe:
            continue

        results.append({
            'ticker': quote.ticker,
            'name': quote.ticker,  # In Phase 2, get actual company name
            'price': quote.price,
            'change_percent': quote.change_percent,
            'market_cap': quote.market_cap,
            'pe_ratio': quote.pe_ratio,
            'volume': quote.volume
        })

    # Sort by market cap descending
    results.sort(key=lambda x: x.get('market_cap') or 0, reverse=True)

    return {
        'results': results,
        'count': len(results)
    }
