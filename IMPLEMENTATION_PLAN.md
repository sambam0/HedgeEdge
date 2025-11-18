# HedgeEdge Implementation Plan - Real Data Integration

**Date:** 2025-11-18
**Goal:** Transform the app from mock data to fully functional with real market data
**Priority:** Real data first, performance optimization later

---

## 🎯 Executive Summary

### Current State
- ✅ Complete UI with 8 pages fully built
- ✅ Backend API infrastructure ready
- ✅ Database schema and models complete
- ❌ **No .env file** - APIs not configured
- ❌ **All data is mocked** - App falls back to random data
- ❌ **FRED macro service incomplete** - Macro indicators not working

### Target State
- ✅ Real stock prices from Alpha Vantage
- ✅ Real financial news from NewsAPI
- ✅ Real economic indicators from FRED
- ✅ Functional portfolio tracking with live P&L
- ✅ All pages working with live data

---

## 📋 Implementation Checklist

### Phase 1: API Configuration (30 minutes)
- [ ] Get Alpha Vantage API key
- [ ] Get NewsAPI key
- [ ] Get FRED API key
- [ ] Create backend/.env file
- [ ] Verify API connections
- [ ] Test backend startup

### Phase 2: FRED Macro Service (2 hours)
- [ ] Implement FRED API client
- [ ] Add economic indicators endpoints
- [ ] Add treasury yield curve fetching
- [ ] Implement caching layer
- [ ] Test macro dashboard

### Phase 3: Database Initialization (30 minutes)
- [ ] Create initialization script
- [ ] Seed default portfolio
- [ ] Add sample positions
- [ ] Generate transaction history
- [ ] Create portfolio snapshots

### Phase 4: Verification & Testing (30 minutes)
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Test all 8 pages
- [ ] Verify real data loading
- [ ] Check API rate limits
- [ ] Document any issues

---

## 🔑 Phase 1: API Configuration

### Step 1.1: Get API Keys

#### Alpha Vantage (Stock Market Data)
- **URL:** https://www.alphavantage.co/support/#api-key
- **Free Tier:** 25 API calls per day, 5 calls per minute
- **What we use it for:**
  - Real-time stock quotes (AAPL, MSFT, etc.)
  - Historical price data
  - Intraday charts
  - Company overviews
  - Market indices (S&P 500, NASDAQ, etc.)

**Registration Steps:**
1. Go to https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Click "GET FREE API KEY"
4. Copy the key (format: `XXXXXXXXXXXXXX`)

#### NewsAPI (Financial News)
- **URL:** https://newsapi.org/register
- **Free Tier:** 100 requests per day
- **What we use it for:**
  - Top financial headlines
  - News search by ticker
  - Business news feed

**Registration Steps:**
1. Go to https://newsapi.org/register
2. Fill out the form (name, email, password)
3. Verify email
4. Go to dashboard and copy API key

#### FRED API (Economic Data)
- **URL:** https://fred.stlouisfed.org/docs/api/api_key.html
- **Free Tier:** Unlimited (with attribution)
- **What we use it for:**
  - Fed Funds Rate
  - CPI (Consumer Price Index)
  - Unemployment Rate
  - GDP Growth
  - Treasury Yield Curve

**Registration Steps:**
1. Go to https://fredaccount.stlouisfed.org/login/secure/
2. Create account (or login)
3. Go to https://fredaccount.stlouisfed.org/apikeys
4. Click "Request API Key"
5. Fill out form (personal use)
6. Copy the key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

#### Optional: Financial Modeling Prep
- **URL:** https://site.financialmodelingprep.com/developer/docs
- **Free Tier:** 250 requests per day
- **What we use it for:** Future enhancement for fundamentals
- **Action:** Skip for now, can add later

### Step 1.2: Create .env File

**Location:** `/home/user/HedgeEdge/backend/.env`

```bash
# Navigate to backend directory
cd /home/user/HedgeEdge/backend

# Create .env file from example
cp .env.example .env
```

**Edit the .env file with your API keys:**

```env
# API Keys
ALPHA_VANTAGE_API_KEY=YOUR_ALPHA_VANTAGE_KEY_HERE
FRED_API_KEY=YOUR_FRED_KEY_HERE
NEWS_API_KEY=YOUR_NEWS_API_KEY_HERE
FMP_API_KEY=your_fmp_key  # Optional - leave as placeholder

# Database
DATABASE_URL=sqlite:///./principle.db
# For PostgreSQL (future): postgresql://user:password@localhost/principle

# Redis (optional - for advanced caching)
REDIS_URL=redis://localhost:6379/0

# API Configuration
API_V1_PREFIX=/api/v1
PROJECT_NAME=Principle Trading Terminal
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Important Notes:**
- Replace `YOUR_ALPHA_VANTAGE_KEY_HERE` with actual key
- Replace `YOUR_FRED_KEY_HERE` with actual key
- Replace `YOUR_NEWS_API_KEY_HERE` with actual key
- Keep DEBUG=True for development
- Never commit .env file to git (already in .gitignore)

### Step 1.3: Verify API Configuration

**Create test script:** `/home/user/HedgeEdge/backend/test_apis.py`

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_alpha_vantage():
    """Test Alpha Vantage API"""
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey={api_key}"

    print("Testing Alpha Vantage API...")
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if 'Global Quote' in data and data['Global Quote']:
            print("✅ Alpha Vantage API working!")
            print(f"   AAPL Price: ${data['Global Quote']['05. price']}")
            return True
        elif 'Note' in data:
            print("⚠️  Alpha Vantage: API call frequency exceeded")
            return False
        else:
            print("❌ Alpha Vantage: Invalid response")
            print(f"   Response: {data}")
            return False
    except Exception as e:
        print(f"❌ Alpha Vantage error: {e}")
        return False

def test_news_api():
    """Test NewsAPI"""
    api_key = os.getenv('NEWS_API_KEY')
    url = f"https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey={api_key}"

    print("\nTesting NewsAPI...")
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if data.get('status') == 'ok' and data.get('articles'):
            print("✅ NewsAPI working!")
            print(f"   Found {len(data['articles'])} articles")
            return True
        else:
            print("❌ NewsAPI: Invalid response")
            print(f"   Response: {data}")
            return False
    except Exception as e:
        print(f"❌ NewsAPI error: {e}")
        return False

def test_fred_api():
    """Test FRED API"""
    api_key = os.getenv('FRED_API_KEY')
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key={api_key}&file_type=json&limit=1&sort_order=desc"

    print("\nTesting FRED API...")
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if 'observations' in data and data['observations']:
            print("✅ FRED API working!")
            latest = data['observations'][0]
            print(f"   Fed Funds Rate: {latest['value']}% (as of {latest['date']})")
            return True
        else:
            print("❌ FRED API: Invalid response")
            print(f"   Response: {data}")
            return False
    except Exception as e:
        print(f"❌ FRED API error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("API Configuration Test")
    print("=" * 60)

    results = {
        'alpha_vantage': test_alpha_vantage(),
        'news_api': test_news_api(),
        'fred': test_fred_api()
    }

    print("\n" + "=" * 60)
    print("Summary:")
    print("=" * 60)
    for api, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {api.replace('_', ' ').title()}: {'Working' if status else 'Failed'}")

    if all(results.values()):
        print("\n🎉 All APIs configured correctly!")
    else:
        print("\n⚠️  Some APIs failed. Please check your keys.")
```

**Run the test:**
```bash
cd /home/user/HedgeEdge/backend
python test_apis.py
```

**Expected Output:**
```
============================================================
API Configuration Test
============================================================
Testing Alpha Vantage API...
✅ Alpha Vantage API working!
   AAPL Price: $175.43

Testing NewsAPI...
✅ NewsAPI working!
   Found 20 articles

Testing FRED API...
✅ FRED API working!
   Fed Funds Rate: 5.33% (as of 2024-10-01)

============================================================
Summary:
============================================================
✅ Alpha Vantage: Working
✅ News Api: Working
✅ Fred: Working

🎉 All APIs configured correctly!
```

---

## 🏛️ Phase 2: FRED Macro Service Implementation

### Step 2.1: Complete FRED API Client

**File:** `/home/user/HedgeEdge/backend/app/services/fred_client.py`

This file needs to be created to handle all FRED API interactions.

**Implementation:**

```python
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.core.config import settings


class FREDClient:
    """Client for Federal Reserve Economic Data (FRED) API"""

    def __init__(self):
        self.api_key = settings.FRED_API_KEY
        self.base_url = "https://api.stlouisfed.org/fred"
        # Cache to reduce API calls
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour cache

    def _get_cache_key(self, series_id: str) -> str:
        """Generate cache key with timestamp bucket"""
        timestamp = int(datetime.now().timestamp() // self.cache_ttl)
        return f"{series_id}_{timestamp}"

    def get_series_latest(self, series_id: str) -> Optional[Dict]:
        """Get latest observation for a FRED series"""
        try:
            # Check cache
            cache_key = self._get_cache_key(series_id)
            if cache_key in self.cache:
                return self.cache[cache_key]

            # Fetch from FRED
            url = f"{self.base_url}/series/observations"
            params = {
                'series_id': series_id,
                'api_key': self.api_key,
                'file_type': 'json',
                'sort_order': 'desc',
                'limit': 1
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'observations' in data and data['observations']:
                observation = data['observations'][0]
                result = {
                    'series_id': series_id,
                    'date': observation['date'],
                    'value': float(observation['value']) if observation['value'] != '.' else None
                }

                # Cache result
                self.cache[cache_key] = result
                return result

            return None

        except Exception as e:
            print(f"Error fetching FRED series {series_id}: {e}")
            return None

    def get_series_historical(self, series_id: str, start_date: str = None,
                             end_date: str = None, limit: int = 100) -> List[Dict]:
        """Get historical observations for a FRED series"""
        try:
            url = f"{self.base_url}/series/observations"
            params = {
                'series_id': series_id,
                'api_key': self.api_key,
                'file_type': 'json',
                'sort_order': 'desc',
                'limit': limit
            }

            if start_date:
                params['observation_start'] = start_date
            if end_date:
                params['observation_end'] = end_date

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'observations' in data:
                observations = []
                for obs in data['observations']:
                    if obs['value'] != '.':
                        observations.append({
                            'date': obs['date'],
                            'value': float(obs['value'])
                        })
                return observations

            return []

        except Exception as e:
            print(f"Error fetching historical FRED series {series_id}: {e}")
            return []

    def get_treasury_yields(self) -> Dict[str, float]:
        """Get treasury yields for yield curve"""
        # Treasury series IDs
        treasury_series = {
            '1M': 'DGS1MO',   # 1-Month Treasury
            '3M': 'DGS3MO',   # 3-Month Treasury
            '6M': 'DGS6MO',   # 6-Month Treasury
            '1Y': 'DGS1',     # 1-Year Treasury
            '2Y': 'DGS2',     # 2-Year Treasury
            '3Y': 'DGS3',     # 3-Year Treasury
            '5Y': 'DGS5',     # 5-Year Treasury
            '7Y': 'DGS7',     # 7-Year Treasury
            '10Y': 'DGS10',   # 10-Year Treasury
            '20Y': 'DGS20',   # 20-Year Treasury
            '30Y': 'DGS30',   # 30-Year Treasury
        }

        yields = {}
        for maturity, series_id in treasury_series.items():
            data = self.get_series_latest(series_id)
            if data and data['value'] is not None:
                yields[maturity] = data['value']
            else:
                # Fallback to mock data if not available
                yields[maturity] = None

        return yields


# Singleton instance
fred_client = FREDClient()
```

### Step 2.2: Implement Macro Service

**File:** `/home/user/HedgeEdge/backend/app/services/macro_service.py`

This file needs to be updated to use the FRED client.

**Implementation:**

```python
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
from app.services.fred_client import fred_client


class MacroService:
    """Service for macroeconomic indicators"""

    # FRED series IDs for economic indicators
    SERIES_IDS = {
        'fed_funds': 'FEDFUNDS',      # Federal Funds Effective Rate
        'cpi': 'CPIAUCSL',            # Consumer Price Index
        'unemployment': 'UNRATE',      # Unemployment Rate
        'gdp': 'GDP',                 # Gross Domestic Product
        'gdp_growth': 'A191RL1Q225SBEA',  # Real GDP Growth
        'inflation': 'FPCPITOTLZGUSA',    # Inflation Rate
        '10y_yield': 'DGS10',         # 10-Year Treasury
        'sp500': 'SP500',             # S&P 500 Index
    }

    def __init__(self):
        self.fred = fred_client

    def get_economic_indicators(self) -> Dict:
        """Get current economic indicators"""
        try:
            # Fetch all indicators
            fed_funds = self.fred.get_series_latest(self.SERIES_IDS['fed_funds'])
            cpi = self.fred.get_series_latest(self.SERIES_IDS['cpi'])
            unemployment = self.fred.get_series_latest(self.SERIES_IDS['unemployment'])
            gdp_growth = self.fred.get_series_latest(self.SERIES_IDS['gdp_growth'])
            ten_year = self.fred.get_series_latest(self.SERIES_IDS['10y_yield'])

            # Calculate inflation YoY if we have CPI
            inflation_rate = None
            if cpi:
                cpi_history = self.fred.get_series_historical(
                    self.SERIES_IDS['cpi'],
                    limit=13
                )
                if len(cpi_history) >= 13:
                    current_cpi = cpi_history[0]['value']
                    year_ago_cpi = cpi_history[12]['value']
                    inflation_rate = ((current_cpi - year_ago_cpi) / year_ago_cpi) * 100

            return {
                'fed_funds_rate': {
                    'value': fed_funds['value'] if fed_funds else None,
                    'date': fed_funds['date'] if fed_funds else None,
                    'unit': '%',
                    'name': 'Federal Funds Rate'
                },
                'unemployment_rate': {
                    'value': unemployment['value'] if unemployment else None,
                    'date': unemployment['date'] if unemployment else None,
                    'unit': '%',
                    'name': 'Unemployment Rate'
                },
                'inflation_rate': {
                    'value': round(inflation_rate, 2) if inflation_rate else None,
                    'date': cpi['date'] if cpi else None,
                    'unit': '%',
                    'name': 'Inflation Rate (YoY)'
                },
                'gdp_growth': {
                    'value': gdp_growth['value'] if gdp_growth else None,
                    'date': gdp_growth['date'] if gdp_growth else None,
                    'unit': '%',
                    'name': 'GDP Growth Rate'
                },
                'ten_year_yield': {
                    'value': ten_year['value'] if ten_year else None,
                    'date': ten_year['date'] if ten_year else None,
                    'unit': '%',
                    'name': '10-Year Treasury Yield'
                }
            }

        except Exception as e:
            print(f"Error fetching economic indicators: {e}")
            return self._get_mock_indicators()

    def get_yield_curve(self) -> Dict:
        """Get treasury yield curve"""
        try:
            yields = self.fred.get_treasury_yields()

            # Format for frontend
            curve_data = []
            maturity_order = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']

            for maturity in maturity_order:
                if maturity in yields and yields[maturity] is not None:
                    curve_data.append({
                        'maturity': maturity,
                        'yield': round(yields[maturity], 3),
                        'months': self._maturity_to_months(maturity)
                    })

            if not curve_data:
                return self._get_mock_yield_curve()

            return {
                'data': curve_data,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'inverted': self._check_inversion(curve_data)
            }

        except Exception as e:
            print(f"Error fetching yield curve: {e}")
            return self._get_mock_yield_curve()

    def get_indicator_history(self, indicator: str, periods: int = 12) -> List[Dict]:
        """Get historical data for an economic indicator"""
        try:
            series_id = self.SERIES_IDS.get(indicator)
            if not series_id:
                return []

            history = self.fred.get_series_historical(series_id, limit=periods)
            return [
                {
                    'date': item['date'],
                    'value': round(item['value'], 2)
                }
                for item in reversed(history)
            ]

        except Exception as e:
            print(f"Error fetching indicator history: {e}")
            return []

    def _maturity_to_months(self, maturity: str) -> int:
        """Convert maturity string to months"""
        mapping = {
            '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24,
            '3Y': 36, '5Y': 60, '7Y': 84, '10Y': 120, '20Y': 240, '30Y': 360
        }
        return mapping.get(maturity, 0)

    def _check_inversion(self, curve_data: List[Dict]) -> bool:
        """Check if yield curve is inverted (2Y > 10Y)"""
        two_year = next((item['yield'] for item in curve_data if item['maturity'] == '2Y'), None)
        ten_year = next((item['yield'] for item in curve_data if item['maturity'] == '10Y'), None)

        if two_year and ten_year:
            return two_year > ten_year
        return False

    def _get_mock_indicators(self) -> Dict:
        """Fallback mock data for development"""
        return {
            'fed_funds_rate': {
                'value': 5.33,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'Federal Funds Rate'
            },
            'unemployment_rate': {
                'value': 3.8,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'Unemployment Rate'
            },
            'inflation_rate': {
                'value': 3.2,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'Inflation Rate (YoY)'
            },
            'gdp_growth': {
                'value': 2.4,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'GDP Growth Rate'
            },
            'ten_year_yield': {
                'value': 4.25,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': '10-Year Treasury Yield'
            }
        }

    def _get_mock_yield_curve(self) -> Dict:
        """Fallback mock yield curve"""
        mock_yields = [
            {'maturity': '1M', 'yield': 5.45, 'months': 1},
            {'maturity': '3M', 'yield': 5.40, 'months': 3},
            {'maturity': '6M', 'yield': 5.35, 'months': 6},
            {'maturity': '1Y', 'yield': 5.20, 'months': 12},
            {'maturity': '2Y', 'yield': 4.95, 'months': 24},
            {'maturity': '3Y', 'yield': 4.75, 'months': 36},
            {'maturity': '5Y', 'yield': 4.50, 'months': 60},
            {'maturity': '7Y', 'yield': 4.40, 'months': 84},
            {'maturity': '10Y', 'yield': 4.25, 'months': 120},
            {'maturity': '20Y', 'yield': 4.50, 'months': 240},
            {'maturity': '30Y', 'yield': 4.35, 'months': 360},
        ]

        return {
            'data': mock_yields,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'inverted': False
        }


# Singleton instance
macro_service = MacroService()
```

### Step 2.3: Update Config to Load FRED API Key

**File:** `/home/user/HedgeEdge/backend/app/core/config.py`

Ensure FRED_API_KEY is loaded:

```python
from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # API Keys
    ALPHA_VANTAGE_API_KEY: str = os.getenv('ALPHA_VANTAGE_API_KEY', '')
    FRED_API_KEY: str = os.getenv('FRED_API_KEY', '')
    FMP_API_KEY: str = os.getenv('FMP_API_KEY', '')
    NEWS_API_KEY: str = os.getenv('NEWS_API_KEY', '')

    # Database
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./principle.db')

    # Redis
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Principle Trading Terminal"
    DEBUG: bool = os.getenv('DEBUG', 'True') == 'True'

    # CORS
    ALLOWED_ORIGINS: List[str] = os.getenv(
        'ALLOWED_ORIGINS',
        'http://localhost:3000'
    ).split(',')

    class Config:
        case_sensitive = True


settings = Settings()
```

### Step 2.4: Add/Update Macro API Endpoints

**File:** `/home/user/HedgeEdge/backend/app/api/v1/endpoints/macro.py`

```python
from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.services.macro_service import macro_service

router = APIRouter()


@router.get("/indicators")
def get_economic_indicators() -> Dict:
    """Get current economic indicators"""
    try:
        indicators = macro_service.get_economic_indicators()
        return indicators
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/yield-curve")
def get_yield_curve() -> Dict:
    """Get treasury yield curve"""
    try:
        curve = macro_service.get_yield_curve()
        return curve
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{indicator}")
def get_indicator_history(indicator: str, periods: int = 12) -> List[Dict]:
    """Get historical data for an economic indicator"""
    try:
        history = macro_service.get_indicator_history(indicator, periods)
        if not history:
            raise HTTPException(status_code=404, detail=f"Indicator {indicator} not found")
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 2.5: Register Macro Router

**File:** `/home/user/HedgeEdge/backend/app/api/v1/api.py`

Ensure macro router is included:

```python
from fastapi import APIRouter
from app.api.v1.endpoints import market, portfolio, watchlist, screener, macro, news, analysis

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])
api_router.include_router(screener.router, prefix="/screener", tags=["screener"])
api_router.include_router(macro.router, prefix="/macro", tags=["macro"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
```

---

## 🗄️ Phase 3: Database Initialization

### Step 3.1: Create Database Seed Script

**File:** `/home/user/HedgeEdge/backend/seed_database.py`

```python
from app.db.session import SessionLocal, engine
from app.models.models import Base, Portfolio, Position, Transaction
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
                purchase_date=purchase_date
            )
            db.add(position)

            # Create buy transaction
            transaction = Transaction(
                portfolio_id=portfolio.id,
                ticker=pos_data['ticker'],
                transaction_type='BUY',
                shares=pos_data['shares'],
                price=pos_data['cost_basis'],
                transaction_date=purchase_date
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
```

### Step 3.2: Run Database Seed

```bash
cd /home/user/HedgeEdge/backend
python seed_database.py
```

**Expected Output:**
```
============================================================
Database Initialization
============================================================
✅ Created portfolio: My Portfolio (ID: 1)
✅ Added position: AAPL - 100 shares @ $150.0
✅ Added position: MSFT - 75 shares @ $320.0
✅ Added position: GOOGL - 50 shares @ $125.0
✅ Added position: AMZN - 60 shares @ $140.0
✅ Added position: TSLA - 45 shares @ $200.0
✅ Added position: NVDA - 80 shares @ $450.0
✅ Added position: META - 40 shares @ $380.0

🎉 Database seeded successfully!
   Portfolio ID: 1
   Total Positions: 7
   Total Transactions: 7
```

---

## 🧪 Phase 4: Verification & Testing

### Step 4.1: Start Backend Server

```bash
cd /home/user/HedgeEdge/backend

# Install dependencies if not already installed
pip install -r requirements.txt

# Start server
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend:**
- Open http://localhost:8000/docs in browser
- Should see Swagger UI with all API endpoints
- Test `/api/v1/macro/indicators` endpoint
- Should return real FRED data, not mock

### Step 4.2: Start Frontend Server

```bash
# In new terminal
cd /home/user/HedgeEdge/frontend

# Install dependencies if not already installed
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 16.0.3
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

### Step 4.3: Test All Pages

**Checklist for each page:**

#### 1. Dashboard (http://localhost:3000)
- [ ] Market indices show real values (not random)
- [ ] Portfolio summary shows seeded positions
- [ ] Total value calculated from real prices
- [ ] Gain/loss shows actual performance

#### 2. Markets (http://localhost:3000/markets)
- [ ] Search bar works (type "AAPL")
- [ ] Live quotes update every 15-30 seconds
- [ ] Charts show real historical data
- [ ] Company info displays correctly
- [ ] Market movers show actual stocks

#### 3. Portfolio (http://localhost:3000/portfolio)
- [ ] Shows 7 seeded positions
- [ ] Current prices are real (not mocked)
- [ ] P&L calculated correctly
- [ ] Risk metrics display
- [ ] Can add new position

#### 4. News (http://localhost:3000/news)
- [ ] Shows today's financial news
- [ ] Articles have real titles and sources
- [ ] Sentiment analysis working
- [ ] Search functionality works
- [ ] Ticker extraction working

#### 5. Analysis (http://localhost:3000/analysis)
- [ ] Risk metrics calculated from portfolio
- [ ] Benchmark vs S&P 500 shows
- [ ] Diversification score displays
- [ ] Correlation matrix renders

#### 6. Macro (http://localhost:3000/macro)
- [ ] **Fed Funds Rate shows real FRED data**
- [ ] **CPI/Inflation shows real value**
- [ ] **Unemployment rate is current**
- [ ] **GDP growth displays**
- [ ] **Treasury yield curve renders correctly**
- [ ] **Yields are realistic (3-5% range)**

#### 7. Watchlist (http://localhost:3000/watchlist)
- [ ] Can add ticker to watchlist
- [ ] Live quotes update
- [ ] Can remove ticker
- [ ] Persistence works (refresh page)

#### 8. Screener (http://localhost:3000/screener)
- [ ] Filters work (price, market cap, P/E)
- [ ] Results show real stocks
- [ ] Sorting works
- [ ] Click to view details

### Step 4.4: Monitor API Calls

**Check backend logs for:**
- ✅ Real API calls (not "using mock data")
- ✅ Cache hits (should see "cache hit" messages)
- ⚠️  API rate limits (if you see "limit exceeded", increase cache TTL)

**Backend Terminal Output:**
```
INFO:     127.0.0.1:54321 - "GET /api/v1/market/quote/AAPL HTTP/1.1" 200 OK
INFO:     127.0.0.1:54322 - "GET /api/v1/macro/indicators HTTP/1.1" 200 OK
INFO:     127.0.0.1:54323 - "GET /api/v1/portfolio/1/positions HTTP/1.1" 200 OK
```

### Step 4.5: Check API Rate Limits

**Alpha Vantage Free Tier Limits:**
- 25 calls per day
- 5 calls per minute

**How to monitor:**
```bash
# Count API calls in logs
grep "alphavantage.co" /var/log/uvicorn.log | wc -l
```

**If hitting limits:**
1. Increase cache TTL in services
2. Reduce polling frequency in frontend
3. Implement Redis for persistent cache
4. Consider upgrading API plan

---

## 📝 Post-Implementation Checklist

### Functionality Verification
- [ ] All 8 pages load without errors
- [ ] Real market data displayed (not mock)
- [ ] FRED macro indicators working
- [ ] Portfolio calculations accurate
- [ ] News feed shows today's articles
- [ ] No console errors in browser
- [ ] No 500 errors in backend

### Performance Check
- [ ] Page load < 5 seconds
- [ ] API responses < 1 second
- [ ] No excessive re-renders
- [ ] Caching working properly

### Data Quality
- [ ] Stock prices match Yahoo Finance
- [ ] Fed Funds Rate matches FRED website
- [ ] Treasury yields realistic
- [ ] News articles are recent (today/yesterday)

---

## 🚨 Troubleshooting Guide

### Problem: "API limit exceeded"

**Alpha Vantage:**
```
{"Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute..."}
```

**Solution:**
1. Increase cache TTL in `market_service.py`:
   ```python
   self.cache_ttl = 300  # 5 minutes instead of 60 seconds
   ```
2. Reduce polling in frontend hooks:
   ```typescript
   refetchInterval: 60 * 1000,  // 60s instead of 15s
   ```

### Problem: "Invalid API key"

**FRED Error:**
```
{"error_code": 400, "error_message": "Bad Request. The value for variable api_key is not registered."}
```

**Solution:**
1. Check `.env` file has correct key
2. Restart backend server (to reload env variables)
3. Verify key at https://fredaccount.stlouisfed.org/apikeys

### Problem: "CORS errors in browser"

**Browser Console:**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
1. Check `ALLOWED_ORIGINS` in `.env` includes `http://localhost:3000`
2. Restart backend server
3. Clear browser cache

### Problem: "Database not found"

**Error:**
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file
```

**Solution:**
```bash
cd /home/user/HedgeEdge/backend
python seed_database.py
```

### Problem: "Module not found" errors

**Error:**
```
ModuleNotFoundError: No module named 'requests'
```

**Solution:**
```bash
cd /home/user/HedgeEdge/backend
pip install -r requirements.txt
```

---

## 📊 API Rate Limit Strategy

### Free Tier Limits Summary

| API | Daily Limit | Per Minute | Cache Strategy |
|-----|-------------|------------|----------------|
| Alpha Vantage | 25 calls | 5 calls | 60-300s TTL |
| NewsAPI | 100 calls | Unlimited | 300s TTL |
| FRED | Unlimited | Unlimited | 3600s TTL |

### Optimization Recommendations

**For Personal Use (Current):**
- Cache TTL: 60-120 seconds for quotes
- Polling: Every 30-60 seconds
- Expected usage: ~20-30 API calls per session
- **Status:** Should stay within free tier limits

**For Multiple Users (Future):**
- Implement Redis cache
- Increase cache TTL to 5 minutes
- Use WebSocket for real-time updates
- Consider paid API tiers

---

## 🎯 Success Criteria

After completing this implementation plan, you should have:

✅ **Real Data Integration**
- Live stock prices from Alpha Vantage
- Current economic indicators from FRED
- Today's financial news from NewsAPI

✅ **Functional Portfolio**
- 7 sample positions with real P&L
- Live price updates
- Accurate performance metrics

✅ **Complete Macro Dashboard**
- Fed Funds Rate (real FRED data)
- CPI, Unemployment, GDP (real FRED data)
- Treasury yield curve (real FRED data)
- Historical trend charts

✅ **Stable Performance**
- No API rate limit errors
- Caching working properly
- Reasonable load times (<5 seconds)

---

## 📞 Next Steps After Implementation

### Immediate (Week 1)
1. Monitor API usage (are you hitting limits?)
2. Adjust cache TTL if needed
3. Add more positions to portfolio
4. Test all features thoroughly

### Short-term (Week 2-4)
1. Implement price alerts
2. Add more technical indicators
3. Enhance news sentiment analysis
4. Add portfolio rebalancing tools

### Medium-term (Month 2-3)
1. Add backtesting capabilities
2. Implement strategy comparison
3. Add options tracking
4. Build mobile-responsive views

### Long-term (Month 4+)
1. Consider upgrading to paid API tiers
2. Add real-time WebSocket connections
3. Implement machine learning predictions
4. Add social sentiment analysis

---

## 📚 Additional Resources

### API Documentation
- **Alpha Vantage:** https://www.alphavantage.co/documentation/
- **FRED:** https://fred.stlouisfed.org/docs/api/fred/
- **NewsAPI:** https://newsapi.org/docs

### Financial Data
- **Yahoo Finance:** (for price verification)
- **FRED Website:** https://fred.stlouisfed.org/ (verify economic data)
- **Treasury.gov:** https://www.treasury.gov/ (yield curve comparison)

### Tools
- **API Testing:** Postman or Insomnia
- **Database Viewer:** DB Browser for SQLite
- **Monitoring:** Chrome DevTools Network tab

---

## 🎉 Final Notes

This implementation plan transforms your app from a UI prototype to a **fully functional trading terminal with real market data**.

**Estimated Time:**
- Phase 1 (API Setup): 30 minutes
- Phase 2 (FRED Service): 2 hours
- Phase 3 (Database): 30 minutes
- Phase 4 (Testing): 30 minutes
- **Total: ~4 hours**

**Key Focus Areas:**
1. ✅ Get real data flowing
2. ✅ FRED macro indicators working
3. ✅ Portfolio tracking functional
4. ⏸️  Performance optimization (later)

Once complete, you'll have a **production-ready personal trading terminal** that rivals Bloomberg Terminal for personal portfolio management! 🚀📈

---

**Last Updated:** 2025-11-18
**Version:** 1.0
**Author:** Claude (AI Assistant)
