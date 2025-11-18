from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models import models, schemas
from app.services.market_service import market_service
from datetime import date

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
