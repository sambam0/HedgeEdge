from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models import models, schemas
from app.services.market_service import market_service

router = APIRouter()


@router.get("/", response_model=List[schemas.Watchlist])
def get_watchlists(db: Session = Depends(get_db)):
    """Get all watchlists"""
    return db.query(models.Watchlist).all()


@router.post("/", response_model=schemas.Watchlist)
def create_watchlist(watchlist: schemas.WatchlistCreate, db: Session = Depends(get_db)):
    """Create a new watchlist"""
    db_watchlist = models.Watchlist(name=watchlist.name)
    db.add(db_watchlist)
    db.commit()
    db.refresh(db_watchlist)
    return db_watchlist


@router.get("/{watchlist_id}", response_model=schemas.Watchlist)
def get_watchlist(watchlist_id: int, db: Session = Depends(get_db)):
    """Get a specific watchlist"""
    watchlist = db.query(models.Watchlist).filter(models.Watchlist.id == watchlist_id).first()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    return watchlist


@router.delete("/{watchlist_id}")
def delete_watchlist(watchlist_id: int, db: Session = Depends(get_db)):
    """Delete a watchlist"""
    watchlist = db.query(models.Watchlist).filter(models.Watchlist.id == watchlist_id).first()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    db.delete(watchlist)
    db.commit()
    return {"message": "Watchlist deleted successfully"}


@router.post("/{watchlist_id}/stocks", response_model=schemas.WatchlistStock)
def add_stock_to_watchlist(
    watchlist_id: int,
    stock: schemas.WatchlistStockCreate,
    db: Session = Depends(get_db)
):
    """Add a stock to a watchlist"""
    watchlist = db.query(models.Watchlist).filter(models.Watchlist.id == watchlist_id).first()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")

    # Check if stock already exists in watchlist
    existing = db.query(models.WatchlistStock).filter(
        models.WatchlistStock.watchlist_id == watchlist_id,
        models.WatchlistStock.ticker == stock.ticker.upper()
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Stock already in watchlist")

    db_stock = models.WatchlistStock(
        watchlist_id=watchlist_id,
        ticker=stock.ticker.upper()
    )
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


@router.delete("/{watchlist_id}/stocks/{stock_id}")
def remove_stock_from_watchlist(
    watchlist_id: int,
    stock_id: int,
    db: Session = Depends(get_db)
):
    """Remove a stock from a watchlist"""
    db_stock = db.query(models.WatchlistStock).filter(
        models.WatchlistStock.id == stock_id,
        models.WatchlistStock.watchlist_id == watchlist_id
    ).first()

    if not db_stock:
        raise HTTPException(status_code=404, detail="Stock not found in watchlist")

    db.delete(db_stock)
    db.commit()
    return {"message": "Stock removed from watchlist"}


@router.get("/{watchlist_id}/quotes")
def get_watchlist_with_quotes(watchlist_id: int, db: Session = Depends(get_db)):
    """Get watchlist with live quotes"""
    watchlist = db.query(models.Watchlist).filter(models.Watchlist.id == watchlist_id).first()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")

    tickers = [stock.ticker for stock in watchlist.stocks]
    if not tickers:
        return {
            'id': watchlist.id,
            'name': watchlist.name,
            'stocks': []
        }

    quotes = market_service.get_multiple_quotes(tickers)

    stocks_with_quotes = []
    for stock in watchlist.stocks:
        quote = next((q for q in quotes if q.ticker == stock.ticker), None)
        if quote:
            stocks_with_quotes.append({
                'id': stock.id,
                'ticker': stock.ticker,
                'added_at': stock.added_at.isoformat(),
                'price': quote.price,
                'change': quote.change,
                'change_percent': quote.change_percent,
                'volume': quote.volume
            })

    return {
        'id': watchlist.id,
        'name': watchlist.name,
        'stocks': stocks_with_quotes
    }
