from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models import models, schemas
from app.services.market_service import market_service
from datetime import date
import os
import requests

router = APIRouter()


@router.get("/", response_model=List[schemas.Portfolio])
def get_portfolios(db: Session = Depends(get_db)):
    """Get all portfolios"""
    return db.query(models.Portfolio).all()


@router.post("/", response_model=schemas.Portfolio)
def create_portfolio(portfolio: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    """Create a new portfolio"""
    db_portfolio = models.Portfolio(name=portfolio.name)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio


@router.get("/{portfolio_id}", response_model=schemas.Portfolio)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Get a specific portfolio"""
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.delete("/{portfolio_id}")
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Delete a portfolio"""
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted successfully"}


@router.get("/{portfolio_id}/positions", response_model=List[schemas.Position])
def get_positions(portfolio_id: int, db: Session = Depends(get_db)):
    """Get all positions in a portfolio"""
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio.positions


@router.post("/{portfolio_id}/positions", response_model=schemas.Position)
def add_position(
    portfolio_id: int,
    position: schemas.PositionCreate,
    db: Session = Depends(get_db)
):
    """Add a position to a portfolio"""
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    db_position = models.Position(
        portfolio_id=portfolio_id,
        ticker=position.ticker.upper(),
        shares=position.shares,
        cost_basis=position.cost_basis,
        purchase_date=position.purchase_date
    )
    db.add(db_position)

    # Also create a transaction record
    db_transaction = models.Transaction(
        portfolio_id=portfolio_id,
        ticker=position.ticker.upper(),
        transaction_type='BUY',
        shares=position.shares,
        price=position.cost_basis / position.shares if position.shares > 0 else 0,
        transaction_date=position.purchase_date
    )
    db.add(db_transaction)

    db.commit()
    db.refresh(db_position)
    return db_position


@router.put("/{portfolio_id}/positions/{position_id}", response_model=schemas.Position)
def update_position(
    portfolio_id: int,
    position_id: int,
    position: schemas.PositionCreate,
    db: Session = Depends(get_db)
):
    """Update a position"""
    db_position = db.query(models.Position).filter(
        models.Position.id == position_id,
        models.Position.portfolio_id == portfolio_id
    ).first()

    if not db_position:
        raise HTTPException(status_code=404, detail="Position not found")

    db_position.ticker = position.ticker.upper()
    db_position.shares = position.shares
    db_position.cost_basis = position.cost_basis
    db_position.purchase_date = position.purchase_date

    db.commit()
    db.refresh(db_position)
    return db_position


@router.delete("/{portfolio_id}/positions/{position_id}")
def delete_position(
    portfolio_id: int,
    position_id: int,
    db: Session = Depends(get_db)
):
    """Delete a position"""
    db_position = db.query(models.Position).filter(
        models.Position.id == position_id,
        models.Position.portfolio_id == portfolio_id
    ).first()

    if not db_position:
        raise HTTPException(status_code=404, detail="Position not found")

    db.delete(db_position)
    db.commit()
    return {"message": "Position deleted successfully"}


@router.get("/{portfolio_id}/performance")
def get_portfolio_performance(portfolio_id: int, db: Session = Depends(get_db)):
    """Get portfolio performance metrics"""
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    positions = portfolio.positions
    if not positions:
        return {
            'total_value': 0,
            'total_cost': 0,
            'total_gain_loss': 0,
            'total_gain_loss_percent': 0,
            'daily_change': 0,
            'daily_change_percent': 0,
            'positions_count': 0,
            'positions': []
        }

    # Get live quotes for all positions
    tickers = [pos.ticker for pos in positions]
    quotes = {q.ticker: q for q in market_service.get_multiple_quotes(tickers)}

    total_value = 0
    total_cost = 0
    daily_change = 0
    positions_data = []

    for pos in positions:
        quote = quotes.get(pos.ticker)
        if not quote:
            continue

        current_value = float(pos.shares) * quote.price
        cost_basis = float(pos.cost_basis)
        gain_loss = current_value - cost_basis
        gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0

        position_daily_change = float(pos.shares) * quote.change

        total_value += current_value
        total_cost += cost_basis
        daily_change += position_daily_change

        positions_data.append({
            'id': pos.id,
            'ticker': pos.ticker,
            'shares': float(pos.shares),
            'cost_basis': cost_basis,
            'purchase_date': pos.purchase_date.isoformat(),
            'current_price': quote.price,
            'current_value': round(current_value, 2),
            'gain_loss': round(gain_loss, 2),
            'gain_loss_percent': round(gain_loss_percent, 2),
            'daily_change': round(position_daily_change, 2),
            'daily_change_percent': quote.change_percent
        })

    total_gain_loss = total_value - total_cost
    total_gain_loss_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0
    daily_change_percent = (daily_change / total_value * 100) if total_value > 0 else 0

    return {
        'total_value': round(total_value, 2),
        'total_cost': round(total_cost, 2),
        'total_gain_loss': round(total_gain_loss, 2),
        'total_gain_loss_percent': round(total_gain_loss_percent, 2),
        'daily_change': round(daily_change, 2),
        'daily_change_percent': round(daily_change_percent, 2),
        'positions_count': len(positions),
        'positions': positions_data
    }


def _alpaca_headers():
    return {
        'APCA-API-KEY-ID': os.environ.get('ALPACA_API_KEY', ''),
        'APCA-API-SECRET-KEY': os.environ.get('ALPACA_SECRET_KEY', ''),
    }

def _alpaca_base():
    return os.environ.get('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets/v2')


@router.get("/alpaca/positions")
def get_alpaca_positions():
    """Get positions from Alpaca"""
    try:
        resp = requests.get(f"{_alpaca_base()}/positions", headers=_alpaca_headers(), timeout=10)
        resp.raise_for_status()
        raw = resp.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Alpaca API error: {str(e)}")

    positions = []
    for p in raw:
        cost_basis = float(p.get('cost_basis', 0))
        current_value = float(p.get('market_value', 0))
        shares = float(p.get('qty', 0))
        current_price = float(p.get('current_price', 0))
        gain_loss = float(p.get('unrealized_pl', 0))
        gain_loss_pct = float(p.get('unrealized_plpc', 0)) * 100
        daily_change = float(p.get('unrealized_intraday_pl', 0))
        daily_change_pct = float(p.get('unrealized_intraday_plpc', 0)) * 100
        positions.append({
            'ticker': p.get('symbol'),
            'shares': shares,
            'cost_basis': cost_basis,
            'current_price': current_price,
            'current_value': current_value,
            'gain_loss': gain_loss,
            'gain_loss_percent': round(gain_loss_pct, 2),
            'daily_change': daily_change,
            'daily_change_percent': round(daily_change_pct, 2),
        })
    return positions


@router.get("/alpaca/summary")
def get_alpaca_summary():
    """Get account summary from Alpaca"""
    try:
        account_resp = requests.get(f"{_alpaca_base()}/account", headers=_alpaca_headers(), timeout=10)
        account_resp.raise_for_status()
        account = account_resp.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Alpaca API error: {str(e)}")

    positions = get_alpaca_positions()

    total_value = float(account.get('portfolio_value', 0))
    total_cost = sum(p['cost_basis'] for p in positions)
    total_gain_loss = sum(p['gain_loss'] for p in positions)
    total_gain_loss_pct = (total_gain_loss / total_cost * 100) if total_cost else 0
    daily_change = sum(p['daily_change'] for p in positions)
    daily_change_pct = (daily_change / total_value * 100) if total_value else 0
    is_paper = 'paper' in _alpaca_base()

    return {
        'total_value': round(total_value, 2),
        'total_cost': round(total_cost, 2),
        'total_gain_loss': round(total_gain_loss, 2),
        'total_gain_loss_percent': round(total_gain_loss_pct, 2),
        'daily_change': round(daily_change, 2),
        'daily_change_percent': round(daily_change_pct, 2),
        'positions_count': len(positions),
        'account_mode': 'paper' if is_paper else 'live',
        'positions': positions,
    }
