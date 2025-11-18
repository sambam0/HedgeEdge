from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app.models.models import Portfolio, Position, Transaction, PortfolioSnapshot
from app.models.schemas import (
    PortfolioCreate, PositionCreate, PositionUpdate, TransactionCreate,
    PortfolioPerformance
)
from app.services.market_service_db import MarketService


class PortfolioService:
    """Service for managing portfolios and positions"""

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

    def delete_portfolio(self, portfolio_id: int) -> bool:
        """Delete a portfolio"""
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio:
            return False

        self.db.delete(portfolio)
        self.db.commit()
        return True

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

    def update_position(self, position_id: int, position_update: PositionUpdate) -> Optional[Position]:
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
                position.current_value = quote.price * float(position.shares)
                cost_value = float(position.cost_basis) * float(position.shares)
                position.profit_loss = position.current_value - cost_value
                position.profit_loss_percent = (position.profit_loss / cost_value * 100) if cost_value > 0 else 0

        return positions

    # Transaction management
    def add_transaction(self, portfolio_id: int, transaction: TransactionCreate) -> Transaction:
        """Add a transaction to portfolio"""
        db_transaction = Transaction(
            portfolio_id=portfolio_id,
            ticker=transaction.ticker.upper(),
            transaction_type=transaction.transaction_type.upper(),
            shares=transaction.shares,
            price=transaction.price,
            transaction_date=transaction.transaction_date
        )
        self.db.add(db_transaction)

        # Update or create position
        position = self.db.query(Position).filter(
            Position.portfolio_id == portfolio_id,
            Position.ticker == transaction.ticker.upper()
        ).first()

        if transaction.transaction_type.upper() == "BUY":
            if position:
                # Update existing position (weighted average cost basis)
                total_cost = (float(position.cost_basis) * float(position.shares)) + (transaction.price * transaction.shares)
                total_shares = float(position.shares) + transaction.shares
                position.shares = total_shares
                position.cost_basis = total_cost / total_shares if total_shares > 0 else 0
            else:
                # Create new position
                position = Position(
                    portfolio_id=portfolio_id,
                    ticker=transaction.ticker.upper(),
                    shares=transaction.shares,
                    cost_basis=transaction.price,
                    purchase_date=transaction.transaction_date
                )
                self.db.add(position)

        elif transaction.transaction_type.upper() == "SELL":
            if position:
                position.shares = float(position.shares) - transaction.shares
                # Delete position if shares reach 0
                if position.shares <= 0:
                    self.db.delete(position)

        self.db.commit()
        self.db.refresh(db_transaction)
        return db_transaction

    def get_transactions(self, portfolio_id: int) -> List[Transaction]:
        """Get all transactions for a portfolio"""
        return self.db.query(Transaction).filter(
            Transaction.portfolio_id == portfolio_id
        ).order_by(Transaction.transaction_date.desc()).all()

    # Performance Calculations
    def get_performance(self, portfolio_id: int) -> PortfolioPerformance:
        """Calculate portfolio performance metrics"""
        positions = self.get_positions(portfolio_id)

        total_value = 0
        total_cost = 0

        for position in positions:
            total_value += position.current_value or 0
            total_cost += float(position.cost_basis) * float(position.shares)

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
        from datetime import timedelta
        yesterday = date.today() - timedelta(days=1)

        snapshot = self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.portfolio_id == portfolio_id,
            PortfolioSnapshot.snapshot_date == yesterday
        ).first()

        if not snapshot:
            return 0

        # Calculate current value
        positions = self.get_positions(portfolio_id)
        current_value = sum(p.current_value or 0 for p in positions)

        return current_value - float(snapshot.total_value)

    def _get_sp500_return(self, portfolio_id: int) -> Optional[float]:
        """Get S&P 500 return for comparison"""
        # Get portfolio start date (earliest purchase)
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio or not portfolio.positions:
            return None

        # For now, return a simple benchmark (can be enhanced later with actual historical data)
        return 10.0  # Placeholder: 10% annual return

    def create_daily_snapshot(self, portfolio_id: int):
        """Create a daily snapshot of portfolio value"""
        positions = self.get_positions(portfolio_id)
        total_value = sum(p.current_value or 0 for p in positions)

        # Calculate daily return
        yesterday = date.today() - timedelta(days=1)
        yesterday_snapshot = self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.portfolio_id == portfolio_id,
            PortfolioSnapshot.snapshot_date == yesterday
        ).first()

        daily_return = 0
        if yesterday_snapshot and float(yesterday_snapshot.total_value) > 0:
            daily_return = ((total_value - float(yesterday_snapshot.total_value)) /
                          float(yesterday_snapshot.total_value) * 100)

        # Get S&P 500 return (placeholder)
        sp500_quote = self.market_service.get_quote("^GSPC")
        sp500_return = sp500_quote.change_percent if sp500_quote else 0

        snapshot = PortfolioSnapshot(
            portfolio_id=portfolio_id,
            snapshot_date=date.today(),
            total_value=total_value,
            daily_return=daily_return,
            sp500_return=sp500_return
        )

        self.db.add(snapshot)
        self.db.commit()
