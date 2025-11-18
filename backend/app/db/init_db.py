from app.db.base import Base, engine, SessionLocal
from app.models import models


def init_db():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def seed_db():
    """Seed database with sample data"""
    print("Seeding database with initial data...")

    db = SessionLocal()

    try:
        # Check if data already exists
        existing_portfolio = db.query(models.Portfolio).first()
        if existing_portfolio:
            print("Database already seeded. Skipping...")
            return

        # Create default portfolio
        portfolio = models.Portfolio(name="Main Portfolio")
        db.add(portfolio)

        # Create default watchlist
        watchlist = models.Watchlist(name="My Watchlist")
        db.add(watchlist)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


def drop_db():
    """Drop all database tables (use with caution!)"""
    print("WARNING: Dropping all database tables...")
    response = input("Are you sure? Type 'yes' to confirm: ")

    if response.lower() == 'yes':
        Base.metadata.drop_all(bind=engine)
        print("All tables dropped!")
    else:
        print("Operation cancelled.")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "init":
            init_db()
        elif command == "seed":
            seed_db()
        elif command == "drop":
            drop_db()
        elif command == "reset":
            drop_db()
            init_db()
            seed_db()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: init, seed, drop, reset")
    else:
        # Default: initialize and seed
        init_db()
        seed_db()
