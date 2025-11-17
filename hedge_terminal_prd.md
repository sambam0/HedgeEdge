# Product Requirements Document (PRD)
# Personal Trading Terminal with Fundamental Analysis & Macro Dashboard

**Project Name:** HedgeTerminal (or whatever you want to call it)

**Version:** 1.0

**Date:** November 17, 2025

**Created for:** Sam - Future Hedge Fund Manager 🚀

---

## 1. Executive Summary

Build a comprehensive web-based trading terminal that combines real-time market data, portfolio tracking, fundamental analysis tools, and macroeconomic indicators. This platform will serve as a personal Bloomberg Terminal alternative to develop investment skills, test strategies, and track performance with the goal of consistently beating the S&P 500.

### Key Objectives:
- Create a unified dashboard for monitoring markets, portfolio, and economic data
- Enable fundamental analysis at scale across thousands of stocks
- Track and analyze macroeconomic indicators and their market correlations
- Build a foundation for future backtesting and algorithmic trading capabilities
- Develop a professional tool that demonstrates technical and financial acumen

---

## 2. Core Features

### 2.1 Real-Time Market Dashboard

**Purpose:** Central hub for monitoring market conditions and individual positions

**Requirements:**
- Display major indices (S&P 500, NASDAQ, DOW, Russell 2000) with live prices
- Customizable watchlist with real-time price updates
- Price charts with multiple timeframes (1D, 5D, 1M, 3M, 6M, 1Y, 5Y, MAX)
- Technical indicators overlay (SMA, EMA, Bollinger Bands, RSI, MACD, Volume)
- Market heat map showing sector performance
- Top gainers/losers of the day
- Most active stocks by volume
- Futures and pre-market indicators

**Technical Specs:**
- Update frequency: Every 15 seconds for free tier APIs (or real-time if using paid tier)
- WebSocket connection for live updates when possible
- Fallback to polling if WebSocket unavailable
- Cache data in Redis to reduce API calls

---

### 2.2 Portfolio Tracker

**Purpose:** Monitor personal positions with live P&L and risk metrics

**Requirements:**
- **Position Management:**
  - Add/edit/remove positions (ticker, shares, cost basis, purchase date)
  - Support for multiple portfolios/accounts
  - Track realized and unrealized gains/losses
  - Transaction history log
  
- **Live Portfolio Metrics:**
  - Total portfolio value
  - Daily P&L ($ and %)
  - Overall return vs S&P 500
  - Individual position performance
  - Cost basis vs current value per position
  
- **Risk Analytics:**
  - Portfolio beta (vs S&P 500)
  - Sector allocation breakdown (pie chart)
  - Position concentration (% of portfolio per stock)
  - Correlation matrix between holdings
  - Volatility metrics (standard deviation, max drawdown)
  - Sharpe ratio calculation

**Technical Specs:**
- Store positions in PostgreSQL
- Calculate metrics on-demand using NumPy/Pandas
- Refresh portfolio values every 30 seconds during market hours
- Historical performance tracking (store daily snapshots)

---

### 2.3 Fundamental Analysis Suite

**Purpose:** Deep dive into company fundamentals to identify value opportunities

**Requirements:**

#### 2.3.1 Stock Screener
- Filter by fundamental metrics:
  - P/E ratio, Forward P/E
  - P/B ratio, P/S ratio
  - PEG ratio
  - Debt-to-Equity
  - Current ratio, Quick ratio
  - ROE, ROA, ROIC
  - Profit margins (gross, operating, net)
  - Revenue growth, Earnings growth
  - Dividend yield, Payout ratio
  - Free cash flow, FCF yield
- Market cap filters
- Sector/industry filters
- Save custom screening criteria
- Export results to CSV

#### 2.3.2 Company Deep Dive
For any individual stock, display:
- **Key Stats:** Market cap, P/E, EPS, Beta, 52-week range, Average volume
- **Financial Statements:** 
  - Income statement (5 years)
  - Balance sheet (5 years)
  - Cash flow statement (5 years)
  - Quarterly and annual views
- **Key Ratios Dashboard:**
  - Valuation ratios
  - Profitability ratios
  - Liquidity ratios
  - Efficiency ratios
  - Growth rates (YoY, QoQ)
- **Peer Comparison:** Compare key metrics against industry competitors
- **Insider Trading:** Recent insider buys/sells
- **Institutional Ownership:** Top holders and recent changes
- **Analyst Ratings:** Consensus rating, price targets
- **Earnings Calendar:** Upcoming earnings dates
- **Earnings Surprises:** Historical beat/miss record

#### 2.3.3 Valuation Tools
- DCF calculator (input assumptions, calculate intrinsic value)
- Comparable company analysis (comps)
- Graham Number calculator
- Magic Formula screener (Greenblatt style)

**Technical Specs:**
- Pull fundamental data from Financial Modeling Prep API or Alpha Vantage
- Cache financial statements (update quarterly)
- Store screener results temporarily
- Use Pandas for ratio calculations and comparisons

---

### 2.4 Macroeconomic Dashboard

**Purpose:** Track economic indicators and understand macro environment

**Requirements:**

#### 2.4.1 Key Economic Indicators
- **Interest Rates & Fed:**
  - Federal Funds Rate (current and historical)
  - Fed meeting calendar and decisions
  - FOMC dot plot expectations
  
- **Treasury Yields:**
  - Yield curve (3M, 2Y, 5Y, 10Y, 30Y)
  - Yield curve inversions highlighted
  - Historical yield curves overlay
  
- **Inflation:**
  - CPI (headline and core)
  - PCE (Fed's preferred measure)
  - PPI
  - Historical trends
  
- **Labor Market:**
  - Unemployment rate
  - Non-farm payrolls
  - Job openings (JOLTS)
  - Wage growth
  
- **GDP & Growth:**
  - GDP growth rate (quarterly, annual)
  - GDP components breakdown
  - Leading economic indicators
  
- **Consumer & Sentiment:**
  - Consumer confidence
  - Retail sales
  - Consumer spending
  - VIX (volatility index)

#### 2.4.2 Macro Correlations
- Show historical correlation between economic indicators and market performance
- Identify what macro conditions favor certain sectors/strategies
- Alert system for significant economic releases

**Technical Specs:**
- Pull from FRED API (Federal Reserve Economic Data)
- Update economic data weekly (or after releases)
- Store historical data for trend analysis
- Create time-series visualizations with Plotly

---

### 2.5 News & Information Feed

**Requirements:**
- Aggregate financial news from multiple sources
- Filter by:
  - Watchlist stocks
  - Portfolio holdings
  - Specific sectors
  - Market-wide news
- Display earnings call transcripts
- SEC filing alerts (10-K, 10-Q, 8-K)
- Breaking news notifications

**Technical Specs:**
- Use NewsAPI or similar aggregator
- Update every 5 minutes
- Store recent news in database for reference
- Simple keyword search functionality

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts + Plotly.js (for advanced financial charts)
- **State Management:** React Context + TanStack Query for data fetching
- **Real-time Updates:** WebSocket client or polling mechanism

**Backend:**
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL (for persistent data)
- **Cache:** Redis (for real-time data, API rate limiting)
- **Background Jobs:** Celery (for periodic data updates, calculations)
- **API Documentation:** Auto-generated via FastAPI (OpenAPI/Swagger)

**Data Processing:**
- **Libraries:** Pandas, NumPy, TA-Lib (technical indicators)
- **Financial Data:** Polars (faster alternative to Pandas for large datasets)

**Infrastructure:**
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway, Render, or DigitalOcean
- **Database:** Supabase (PostgreSQL) or Railway
- **Cache:** Redis Cloud (free tier) or Railway

**External APIs:**
- **Market Data:** 
  - Alpha Vantage (free tier: 500 calls/day)
  - Polygon.io (good free tier)
  - Yahoo Finance (via yfinance library - unlimited but unofficial)
- **Fundamental Data:** Financial Modeling Prep (250 calls/day free)
- **Economic Data:** FRED API (Federal Reserve - free, unlimited)
- **News:** NewsAPI (100 calls/day free)

---

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Dashboard │ │Portfolio │ │ Screener │  + more    │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────────────┐
│              Backend API (FastAPI)                   │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Market Data  │  │  Portfolio   │                 │
│  │   Service    │  │   Service    │                 │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Fundamental  │  │    Macro     │                 │
│  │   Service    │  │   Service    │                 │
│  └──────────────┘  └──────────────┘                │
└─────────┬───────────────┬───────────────────────────┘
          │               │
┌─────────▼─────┐  ┌──────▼──────┐  ┌──────────────┐
│  PostgreSQL   │  │    Redis    │  │ External APIs│
│  (Persistent) │  │   (Cache)   │  │(Alpha Vantage│
│               │  │             │  │ FRED, etc.)  │
└───────────────┘  └─────────────┘  └──────────────┘
```

---

### 3.3 Database Schema

**Key Tables:**

```sql
-- User portfolios
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Individual positions
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    ticker VARCHAR(10),
    shares DECIMAL(15, 4),
    cost_basis DECIMAL(15, 2),
    purchase_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transaction history
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    ticker VARCHAR(10),
    transaction_type VARCHAR(10), -- 'BUY' or 'SELL'
    shares DECIMAL(15, 4),
    price DECIMAL(15, 2),
    transaction_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily portfolio snapshots (for historical performance)
CREATE TABLE portfolio_snapshots (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    snapshot_date DATE,
    total_value DECIMAL(15, 2),
    daily_return DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Watchlist
CREATE TABLE watchlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE watchlist_stocks (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER REFERENCES watchlists(id),
    ticker VARCHAR(10),
    added_at TIMESTAMP DEFAULT NOW()
);

-- Cached stock data (to reduce API calls)
CREATE TABLE stock_cache (
    ticker VARCHAR(10) PRIMARY KEY,
    current_price DECIMAL(15, 2),
    change DECIMAL(15, 2),
    change_percent DECIMAL(10, 4),
    volume BIGINT,
    market_cap BIGINT,
    pe_ratio DECIMAL(10, 2),
    updated_at TIMESTAMP
);

-- Economic indicators
CREATE TABLE economic_indicators (
    id SERIAL PRIMARY KEY,
    indicator_name VARCHAR(100),
    value DECIMAL(15, 4),
    date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Endpoints Structure

### 4.1 Market Data Endpoints

```
GET  /api/v1/market/indices          # Get major indices data
GET  /api/v1/market/quote/{ticker}   # Get real-time quote
GET  /api/v1/market/chart/{ticker}   # Get historical price data
GET  /api/v1/market/movers           # Top gainers/losers
GET  /api/v1/market/sectors          # Sector performance
GET  /api/v1/market/search           # Search for stocks by name/ticker
```

### 4.2 Portfolio Endpoints

```
GET    /api/v1/portfolio                    # Get all portfolios
POST   /api/v1/portfolio                    # Create new portfolio
GET    /api/v1/portfolio/{id}               # Get specific portfolio
GET    /api/v1/portfolio/{id}/positions     # Get all positions
POST   /api/v1/portfolio/{id}/positions     # Add position
PUT    /api/v1/portfolio/{id}/positions/{pos_id}  # Update position
DELETE /api/v1/portfolio/{id}/positions/{pos_id}  # Remove position
GET    /api/v1/portfolio/{id}/performance   # Get performance metrics
GET    /api/v1/portfolio/{id}/analytics     # Risk analytics
```

### 4.3 Fundamental Analysis Endpoints

```
POST /api/v1/screener                  # Run stock screener with filters
GET  /api/v1/fundamental/{ticker}      # Get all fundamental data
GET  /api/v1/fundamental/{ticker}/financials   # Financial statements
GET  /api/v1/fundamental/{ticker}/ratios       # Key ratios
GET  /api/v1/fundamental/{ticker}/peers        # Peer comparison
GET  /api/v1/fundamental/{ticker}/insider      # Insider trading
GET  /api/v1/fundamental/{ticker}/institutional # Institutional ownership
POST /api/v1/valuation/dcf             # DCF calculator
```

### 4.4 Macro Endpoints

```
GET /api/v1/macro/indicators           # Get all macro indicators
GET /api/v1/macro/yield-curve          # Treasury yield curve
GET /api/v1/macro/fed                  # Fed funds rate & meetings
GET /api/v1/macro/inflation            # Inflation data (CPI, PCE)
GET /api/v1/macro/employment           # Labor market data
GET /api/v1/macro/gdp                  # GDP data
```

### 4.5 News Endpoints

```
GET /api/v1/news                       # Get latest market news
GET /api/v1/news/{ticker}              # News for specific stock
GET /api/v1/news/earnings              # Upcoming earnings
```

---

## 5. User Interface Design

### 5.1 Layout Structure

**Main Navigation (Sidebar or Top Nav):**
- Dashboard (home)
- Portfolio
- Screener
- Macro
- Watchlist
- News
- Settings

### 5.2 Key Screens

#### Dashboard Screen
- **Top Row:** Major indices with sparklines
- **Second Row:** Portfolio summary card + Daily movers
- **Third Row:** Watchlist with live prices
- **Fourth Row:** Market sectors heat map
- **Bottom:** Recent news feed

#### Portfolio Screen
- **Header:** Total value, daily P&L, all-time return vs S&P
- **Positions Table:** Ticker, shares, cost basis, current value, P&L, %change
- **Charts Section:** 
  - Portfolio value over time
  - Sector allocation pie chart
  - Position concentration bar chart
- **Risk Metrics Panel:** Beta, volatility, correlation matrix

#### Screener Screen
- **Left Panel:** Filters (expandable categories)
  - Valuation
  - Profitability  
  - Growth
  - Financial Health
  - Dividends
- **Right Panel:** Results table
  - Sortable columns
  - Click to view company deep dive
  - Export functionality

#### Stock Deep Dive (Modal or Dedicated Page)
- **Header:** Price, chart, key stats
- **Tabs:**
  - Overview (snapshot of key metrics)
  - Financials (statements)
  - Ratios (comprehensive ratios dashboard)
  - Peers (comparison table)
  - Ownership (insider/institutional)
  - News & Events

#### Macro Screen
- **Grid Layout:**
  - Fed funds rate card with historical chart
  - Yield curve visualization
  - Inflation metrics (CPI/PCE) with trends
  - Employment dashboard
  - GDP growth chart
  - Market volatility (VIX)
- **Correlation section:** How macro affects sectors/markets

---

## 6. Phase 1 MVP Features (Launch in 2-3 weeks)

**Goal:** Build core functionality to start using daily

### Must-Have Features:
1. ✅ Market dashboard with live prices for major indices
2. ✅ Watchlist (add/remove stocks, see live prices)
3. ✅ Basic portfolio tracker (add positions, see current value & P&L)
4. ✅ Price charts with 5 timeframes
5. ✅ Simple stock screener (P/E, market cap, sector filters)
6. ✅ Company overview page (key stats, price, basic info)
7. ✅ Basic macro indicators (Fed rate, unemployment, CPI)
8. ✅ Responsive design (works on desktop + mobile)

### Nice-to-Have (if time):
- Technical indicators on charts
- News feed
- Sector heat map

---

## 7. Future Phases (Post-MVP)

### Phase 2: Advanced Analytics (Month 2)
- Full fundamental analysis suite
- DCF calculator and valuation tools
- Comprehensive macro dashboard
- Historical portfolio performance tracking
- Risk metrics (beta, Sharpe ratio, etc.)

### Phase 3: Backtesting Engine (Month 3)
- Build historical backtesting system
- Test strategies against 10+ years of data
- Strategy comparison tools
- Optimization framework

### Phase 4: Automation & Alerts (Month 4)
- Price alerts
- Earnings alerts
- Macro event notifications
- Automated screening (run daily, email results)

### Phase 5: Social & Sharing (Month 5)
- Share portfolio performance
- Strategy marketplace
- Community features (optional)

---

## 8. Performance Requirements

- **Page Load:** Initial load < 3 seconds
- **API Response Time:** < 500ms for most endpoints
- **Real-time Updates:** Price updates within 30 seconds during market hours
- **Screener:** Results in < 5 seconds for 5000+ stocks
- **Charts:** Render smoothly with 1000+ data points

---

## 9. Security & Privacy

- No user authentication required initially (single user)
- API keys stored in environment variables (never in frontend)
- Rate limiting on backend to prevent API quota exhaustion
- Input validation on all user-submitted data
- SQL injection prevention via ORM

**Future:** Add authentication if making multi-user or sharing publicly

---

## 10. Success Metrics

### Technical Metrics:
- Uptime: 99%+ availability
- API success rate: 95%+
- Page load times meeting targets

### Usage Metrics (Personal):
- Daily active use (logging in daily)
- Time spent analyzing stocks
- Number of positions tracked
- Screener queries run per week

### Investment Metrics:
- Portfolio performance vs S&P 500
- Win rate on trades
- Average holding period
- Sharpe ratio improvement over time

---

## 11. Development Timeline

### Week 1-2: Foundation
- Set up project structure (Next.js + FastAPI)
- Set up database and basic models
- Implement market data API integration
- Build basic dashboard UI
- Create watchlist functionality

### Week 3: Portfolio
- Build portfolio tracker backend
- Create portfolio UI
- Implement position management
- Add basic performance calculations

### Week 4: Screener & Company Pages
- Build stock screener with filters
- Create company deep dive page
- Pull fundamental data
- Display financial metrics

### Week 5: Macro Dashboard
- Integrate FRED API
- Build macro indicators display
- Create economic data visualizations

### Week 6+: Polish & Advanced Features
- Add technical indicators to charts
- Implement news feed
- Build risk analytics
- Performance optimization
- Bug fixes and UX improvements

---

## 12. Technical Considerations

### API Rate Limits:
- Alpha Vantage: 500 calls/day (free tier)
- Use caching aggressively in Redis
- Batch requests where possible
- Store historical data to reduce future calls
- Consider upgrading to paid tier if needed

### Data Freshness:
- Real-time prices: Update every 15-30 seconds
- Fundamental data: Update daily or weekly
- Economic data: Update after official releases
- News: Update every 5 minutes

### Scalability:
- Design for single user initially
- Code should be clean enough to add multi-user later
- Use environment variables for all configuration
- Modular service architecture

---

## 13. Resources & Documentation

### APIs to Use:
- **Alpha Vantage:** https://www.alphavantage.co/documentation/
- **FRED:** https://fred.stlouisfed.org/docs/api/
- **Financial Modeling Prep:** https://site.financialmodelingprep.com/developer/docs
- **Yahoo Finance (yfinance):** https://github.com/ranaroussi/yfinance

### Learning Resources:
- FastAPI docs: https://fastapi.tiangolo.com/
- Next.js docs: https://nextjs.org/docs
- Pandas for finance: https://github.com/stefmolin/stock-analysis

---

## 14. Risk & Challenges

### Potential Issues:
1. **API Rate Limits:** Hitting limits on free tiers
   - **Mitigation:** Aggressive caching, batch requests, consider paid tier
   
2. **Data Quality:** Free APIs may have delays or inaccuracies
   - **Mitigation:** Cross-reference multiple sources when critical
   
3. **Complexity Creep:** Too many features, never ship
   - **Mitigation:** Strict MVP scope, ship Phase 1 in 3 weeks max
   
4. **Market Hours:** Some APIs only work during market hours
   - **Mitigation:** Cache data, handle off-hours gracefully

5. **Cost:** APIs, hosting, database may have costs
   - **Mitigation:** Start with free tiers, upgrade only when necessary

---

## 15. Definition of Done

**MVP is complete when:**
- ✅ Can add stocks to watchlist and see live prices
- ✅ Can add portfolio positions and see current P&L
- ✅ Can screen stocks by basic filters (P/E, market cap)
- ✅ Can view company overview with key stats
- ✅ Can see major indices performance
- ✅ Can view basic macro indicators
- ✅ Works on desktop and mobile
- ✅ Deployed and accessible via URL

**Ready to use daily for real trading decisions!**

---

## 16. Notes for Claude Code

When building this project:
1. Start with backend API structure first (FastAPI skeleton)
2. Set up database models and migrations
3. Integrate one data source at a time (start with Alpha Vantage)
4. Build frontend components iteratively
5. Test each feature thoroughly before moving on
6. Use TypeScript for type safety
7. Write clean, well-documented code
8. Add error handling and loading states
9. Make it look professional - this is portfolio-worthy
10. Have fun and learn a ton about markets!

---

**Let's build something incredible! 🚀📈**
