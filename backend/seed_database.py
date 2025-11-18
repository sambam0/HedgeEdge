from app.db.base import SessionLocal, engine, Base
from app.models.models import Portfolio, Position, Transaction
from datetime import datetime, timedelta
import random

# Create all tables
Base.metadata.create_all(bind=engine)

def seed_database():
    """Seed the database with initial data"""
    db = SessionLocal()

    try:
        # Check if portfolio already exists
        existing = db.query(Portfolio).first()
        if existing:
            print("Database already seeded. Skipping...")
            return

        # Create default portfolio
        portfolio = Portfolio(name="My Portfolio")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        print(f"✅ Created portfolio: {portfolio.name} (ID: {portfolio.id})")

        # Sample positions with realistic data
        positions_data = [
            {'ticker': 'AAPL', 'shares': 100, 'cost_basis': 150.00, 'days_ago': 180},
            {'ticker': 'MSFT', 'shares': 75, 'cost_basis': 320.00, 'days_ago': 150},
            {'ticker': 'GOOGL', 'shares': 50, 'cost_basis': 125.00, 'days_ago': 120},
            {'ticker': 'AMZN', 'shares': 60, 'cost_basis': 140.00, 'days_ago': 90},
            {'ticker': 'TSLA', 'shares': 45, 'cost_basis': 200.00, 'days_ago': 60},
            {'ticker': 'NVDA', 'shares': 80, 'cost_basis': 450.00, 'days_ago': 200},
            {'ticker': 'META', 'shares': 40, 'cost_basis': 380.00, 'days_ago': 100},
        ]

        # Create positions and transactions
        for pos_data in positions_data:
            purchase_date = datetime.now() - timedelta(days=pos_data['days_ago'])

            # Create position
            position = Position(
                portfolio_id=portfolio.id,
                ticker=pos_data['ticker'],
                shares=pos_data['shares'],
                cost_basis=pos_data['cost_basis'],
                purchase_date=purchase_date.date()
            )
            db.add(position)

            # Create buy transaction
            transaction = Transaction(
                portfolio_id=portfolio.id,
                ticker=pos_data['ticker'],
                transaction_type='BUY',
                shares=pos_data['shares'],
                price=pos_data['cost_basis'],
                transaction_date=purchase_date.date()
            )
            db.add(transaction)

            print(f"✅ Added position: {pos_data['ticker']} - {pos_data['shares']} shares @ ${pos_data['cost_basis']}")

        db.commit()

        print("\n🎉 Database seeded successfully!")
        print(f"   Portfolio ID: {portfolio.id}")
        print(f"   Total Positions: {len(positions_data)}")
        print(f"   Total Transactions: {len(positions_data)}")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Database Initialization")
    print("=" * 60)
    seed_database()
