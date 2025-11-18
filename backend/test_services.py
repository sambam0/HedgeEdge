"""Test script for backend services"""
import sys
sys.path.insert(0, '/home/user/HedgeEdge/backend')

from app.db.base import SessionLocal
from app.services.market_service_db import MarketService
from app.services.portfolio_service import PortfolioService
from app.services.screener_service import ScreenerService
from app.services.watchlist_service import WatchlistService
from app.models.schemas import PositionCreate, WatchlistStockCreate
from datetime import date

def test_market_service():
    """Test market data service"""
    print("\n=== Testing Market Service ===")
    db = SessionLocal()
    try:
        service = MarketService(db)

        # Test get quote
        print("\n1. Testing get_quote(AAPL)...")
        quote = service.get_quote("AAPL")
        print(f"   ✓ AAPL: ${quote.price} ({quote.change_percent:+.2f}%)")

        # Test get indices
        print("\n2. Testing get_indices()...")
        indices = service.get_indices()
        for idx in indices:
            print(f"   ✓ {idx.name}: ${idx.price:,.2f} ({idx.change_percent:+.2f}%)")

        # Test search
        print("\n3. Testing search('Apple')...")
        results = service.search("Apple")
        if results:
            print(f"   ✓ Found {len(results)} results")
            for r in results[:3]:
                print(f"     - {r['ticker']}: {r['name']}")
        else:
            print("   ⚠ No results (API limit may be reached, using mock data)")

        print("\n✓ Market Service: PASSED")
    except Exception as e:
        print(f"\n✗ Market Service: FAILED - {e}")
    finally:
        db.close()

def test_portfolio_service():
    """Test portfolio service"""
    print("\n=== Testing Portfolio Service ===")
    db = SessionLocal()
    try:
        service = PortfolioService(db)

        # Get existing portfolio
        print("\n1. Testing get_all_portfolios()...")
        portfolios = service.get_all_portfolios()
        print(f"   ✓ Found {len(portfolios)} portfolio(s)")

        if portfolios:
            portfolio = portfolios[0]
            print(f"   Portfolio: {portfolio.name} (ID: {portfolio.id})")

            # Test add position
            print("\n2. Testing add_position()...")
            position = service.add_position(
                portfolio.id,
                PositionCreate(
                    ticker="AAPL",
                    shares=10,
                    cost_basis=150.00,
                    purchase_date=date.today()
                )
            )
            print(f"   ✓ Added position: {position.ticker} - {position.shares} shares @ ${position.cost_basis}")

            # Test get positions
            print("\n3. Testing get_positions()...")
            positions = service.get_positions(portfolio.id)
            print(f"   ✓ Found {len(positions)} position(s)")
            for pos in positions:
                print(f"     - {pos.ticker}: {pos.shares} shares, Current: ${pos.current_value:.2f}, P/L: ${pos.profit_loss:.2f}")

            # Test get performance
            print("\n4. Testing get_performance()...")
            perf = service.get_performance(portfolio.id)
            print(f"   ✓ Total Value: ${perf.total_value:,.2f}")
            print(f"   ✓ Total Cost: ${perf.total_cost:,.2f}")
            print(f"   ✓ P/L: ${perf.total_gain_loss:,.2f} ({perf.total_gain_loss_percent:+.2f}%)")

        print("\n✓ Portfolio Service: PASSED")
    except Exception as e:
        print(f"\n✗ Portfolio Service: FAILED - {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def test_watchlist_service():
    """Test watchlist service"""
    print("\n=== Testing Watchlist Service ===")
    db = SessionLocal()
    try:
        service = WatchlistService(db)

        # Get existing watchlist
        print("\n1. Testing get_all_watchlists()...")
        watchlists = service.get_all_watchlists()
        print(f"   ✓ Found {len(watchlists)} watchlist(s)")

        if watchlists:
            watchlist = watchlists[0]
            print(f"   Watchlist: {watchlist.name} (ID: {watchlist.id})")

            # Test add stock
            print("\n2. Testing add_stock()...")
            stock = service.add_stock(
                watchlist.id,
                WatchlistStockCreate(ticker="MSFT")
            )
            print(f"   ✓ Added stock: {stock.ticker}")

            # Test get watchlist with prices
            print("\n3. Testing get_watchlist() with live prices...")
            watchlist_with_prices = service.get_watchlist(watchlist.id)
            if watchlist_with_prices and watchlist_with_prices.stocks:
                print(f"   ✓ Found {len(watchlist_with_prices.stocks)} stock(s)")
                for stock in watchlist_with_prices.stocks:
                    print(f"     - {stock.ticker}: ${stock.current_price:.2f} ({stock.change_percent:+.2f}%)")

        print("\n✓ Watchlist Service: PASSED")
    except Exception as e:
        print(f"\n✗ Watchlist Service: FAILED - {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def test_screener_service():
    """Test screener service"""
    print("\n=== Testing Screener Service ===")
    db = SessionLocal()
    try:
        service = ScreenerService(db)

        # The screener needs cached data, so let's just test that it runs
        print("\n1. Testing screen_stocks() with no filters...")
        from app.models.schemas import StockScreenerFilters
        results = service.screen_stocks(StockScreenerFilters())
        print(f"   ✓ Found {len(results)} stock(s) in cache")

        print("\n✓ Screener Service: PASSED")
    except Exception as e:
        print(f"\n✗ Screener Service: FAILED - {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("HedgeEdge Backend Services Test Suite")
    print("=" * 60)

    test_market_service()
    test_portfolio_service()
    test_watchlist_service()
    test_screener_service()

    print("\n" + "=" * 60)
    print("Test Suite Complete!")
    print("=" * 60)
