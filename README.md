# Principle - Personal Trading Terminal

A comprehensive web-based trading terminal that combines real-time market data, portfolio tracking, fundamental analysis tools, and macroeconomic indicators.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Market Data
- **Live Market Indices**: Real-time tracking of S&P 500, NASDAQ, Dow Jones, and Russell 2000
- **Stock Quotes**: Live price updates with Alpha Vantage integration
- **Price Charts**: Historical data visualization with multiple timeframes
- **Market Movers**: Top gainers and losers tracking

### Portfolio Management
- **Position Tracking**: Monitor all your stock positions in one place
- **Live P&L Calculation**: Real-time profit/loss tracking
- **Performance Metrics**: Daily changes, total returns, vs S&P 500 comparison
- **Risk Analytics**: Portfolio concentration, diversification scores
- **Transaction History**: Complete record of all trades

### Watchlist
- **Custom Watchlists**: Create and manage multiple watchlists
- **Live Quotes**: Real-time price updates for watched stocks
- **Quick Add/Remove**: Easy management of watched securities

### Stock Screener
- **Filter by Metrics**: Screen stocks by P/E ratio, market cap, price, and more
- **Sortable Results**: Find the best opportunities quickly
- **Detailed View**: Access comprehensive stock information

### Macro Dashboard
- **Economic Indicators**: Fed funds rate, CPI, unemployment, GDP
- **Treasury Yields**: Complete yield curve (3M to 30Y)
- **Visual Analytics**: Charts and metrics for macro trends
- **FRED Integration**: Reliable data from Federal Reserve

### UI/UX
- **Dark Mode**: Easy on the eyes with full dark mode support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional UI**: Clean, modern design following best practices
- **Real-time Updates**: Live data refresh every 30 seconds
- **Loading States**: Smooth skeleton loading for better UX

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **TanStack Query**: Powerful data fetching and caching
- **Lucide React**: Beautiful icon library
- **Recharts**: Charting library for data visualization

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database (production: PostgreSQL)
- **Pydantic**: Data validation
- **Python 3.11+**: Latest Python features

### APIs
- **Alpha Vantage**: Stock market data
- **FRED API**: Federal Reserve economic data
- **Financial Modeling Prep**: Fundamental data (planned)
- **NewsAPI**: Financial news (planned)

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm or yarn**

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/sambam0/HedgeEdge.git
cd HedgeEdge
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
pip install -r requirements.txt

# The .env file is already configured with API keys
# Start the server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
\`\`\`

Backend will be running at: `http://localhost:8000`

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

Frontend will be running at: `http://localhost:3000`

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🎯 Usage

### Dashboard
Navigate to the main dashboard to see:
- Market indices overview
- Portfolio summary
- Quick metrics

### Portfolio
- View all your positions
- Track real-time P&L
- Analyze risk metrics
- Export data

### Watchlist
- Create custom watchlists
- Monitor favorite stocks
- Get live price updates

### Screener
- Filter stocks by various criteria
- Sort and analyze results
- Click to view detailed information

### Macro
- Monitor key economic indicators
- View treasury yield curve
- Track Fed policy

## 🔧 Configuration

### API Keys

The app uses the following APIs (keys already configured in `.env`):
- **Alpha Vantage**: Stock market data
- **FRED**: Economic data
- **FMP**: Fundamental data
- **NewsAPI**: News aggregation

To use your own keys, update `backend/.env`:

\`\`\`env
ALPHA_VANTAGE_API_KEY=your_key_here
FRED_API_KEY=your_key_here
FMP_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
\`\`\`

## 🏗️ Project Structure

\`\`\`
HedgeEdge/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── models/          # Database models & schemas
│   │   ├── services/        # Business logic
│   │   ├── core/            # Configuration
│   │   └── db/              # Database setup
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components
│   ├── lib/                 # Utilities
│   └── package.json
├── DESIGN_SYSTEM.md         # UI/UX guidelines
└── hedge_terminal_prd.md    # Product requirements
\`\`\`

## 🎨 Design System

The app follows a comprehensive design system documented in `DESIGN_SYSTEM.md`:
- Color palette (primary blues, market colors for gains/losses)
- Typography scale (Inter font family)
- Component library
- Responsive breakpoints
- Accessibility guidelines

## 📊 Database Schema

- **Portfolios**: User portfolio containers
- **Positions**: Individual stock positions
- **Transactions**: Trade history
- **Watchlists**: Custom stock lists
- **Stock Cache**: Cached market data
- **Economic Indicators**: Macro data storage

## 🚢 Deployment

### Frontend (Vercel)
\`\`\`bash
cd frontend
vercel deploy
\`\`\`

### Backend (Railway/Render)
\`\`\`bash
cd backend
# Follow platform-specific deployment guide
\`\`\`

## 🧪 Testing

### Backend
\`\`\`bash
cd backend
pytest
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm test
\`\`\`

## 📈 Performance

- **Page Load**: < 3 seconds
- **API Response**: < 500ms
- **Real-time Updates**: Every 30 seconds
- **Lighthouse Score**: > 90

## 🔐 Security

- API keys stored in environment variables
- No authentication required (single user)
- Rate limiting on backend
- Input validation via Pydantic
- SQL injection prevention via ORM

## 🛣️ Roadmap

### Phase 2 (Completed ✅)
- [x] Advanced fundamental analysis
- [x] DCF calculator
- [x] Peer comparison tools

### Phase 3 (Planned)
- [ ] Backtesting engine
- [ ] Strategy comparison
- [ ] Historical data analysis

### Phase 4 (Planned)
- [ ] Price alerts
- [ ] Earnings notifications
- [ ] Automated screening

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

MIT License - feel free to use this for your own trading terminal.

## 🙏 Acknowledgments

- **Alpha Vantage** for market data API
- **FRED** for economic data
- **Next.js** team for the amazing framework
- **FastAPI** for the backend framework
- **TailwindCSS** for the styling system

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ by Sam**

**Let's beat the market! 🚀📈**
