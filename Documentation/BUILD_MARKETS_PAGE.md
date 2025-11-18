# Build Instructions: Markets Page

**Page Route:** `/markets`
**Estimated Time:** 6-8 days
**Priority:** High Value

---

## 🎯 Goal

Build a complete Markets page with real-time stock analysis, candlestick charts with technical indicators, company fundamentals, and market movers.

---

## 📋 Step-by-Step Instructions

### PHASE 1: Backend API Endpoints (2-3 days)

#### Step 1.1: Add Intraday Endpoint

**File:** `backend/app/api/v1/market.py`

Add this endpoint:

```python
@router.get("/intraday/{ticker}")
def get_intraday_data(
    ticker: str,
    interval: str = "5min"  # 1min, 5min, 15min, 30min, 60min
):
    """Get intraday price data for detailed charts"""
    from app.services.market_service import MarketService
    market_service = MarketService(db=None)

    data = market_service.get_intraday_data(ticker, interval)
    return data
```

#### Step 1.2: Add Company Overview Endpoint

**File:** `backend/app/api/v1/market.py`

Add this endpoint:

```python
@router.get("/company/{ticker}")
def get_company_overview(ticker: str):
    """Get detailed company information and fundamentals"""
    from app.services.market_service import MarketService
    market_service = MarketService(db=None)

    overview = market_service.get_company_overview(ticker)
    if not overview:
        raise HTTPException(status_code=404, detail=f"Company {ticker} not found")
    return overview
```

#### Step 1.3: Add Technical Indicators Endpoint

**File:** `backend/app/api/v1/market.py`

Add this endpoint:

```python
from typing import List

@router.get("/technical/{ticker}")
def get_technical_indicators(
    ticker: str,
    indicators: List[str] = Query(["SMA", "RSI"])
):
    """Get calculated technical indicators"""
    from app.services.market_service import MarketService
    market_service = MarketService(db=None)

    return market_service.calculate_technical_indicators(ticker, indicators)
```

#### Step 1.4: Update Market Service

**File:** `backend/app/services/market_service.py`

Add these methods to the `MarketService` class:

```python
def get_intraday_data(self, ticker: str, interval: str = "5min") -> List[Dict]:
    """Fetch intraday data from Alpha Vantage"""
    from app.services.alpha_vantage import AlphaVantageClient

    av_client = AlphaVantageClient()
    data = av_client.get_intraday_prices(ticker, interval)

    return data

def get_company_overview(self, ticker: str) -> Optional[Dict]:
    """Fetch company overview from Alpha Vantage"""
    from app.services.alpha_vantage import AlphaVantageClient

    av_client = AlphaVantageClient()
    overview = av_client.get_company_overview(ticker)

    return overview

def calculate_technical_indicators(self, ticker: str, indicators: List[str]) -> Dict:
    """Calculate technical indicators on historical data"""
    # Get 6 months of data
    data = self.get_chart_data(ticker, period="6M")

    if not data or not data.data:
        return {}

    results = {}
    prices = [point["value"] for point in data.data]

    if "SMA" in indicators:
        results["sma_20"] = self._calculate_sma(prices, 20)
        results["sma_50"] = self._calculate_sma(prices, 50)
        results["sma_200"] = self._calculate_sma(prices, 200)

    if "RSI" in indicators:
        results["rsi"] = self._calculate_rsi(prices, 14)

    if "MACD" in indicators:
        results["macd"] = self._calculate_macd(prices)

    return results

def _calculate_sma(self, prices: List[float], period: int) -> List[Optional[float]]:
    """Calculate Simple Moving Average"""
    sma = []
    for i in range(len(prices)):
        if i < period - 1:
            sma.append(None)
        else:
            avg = sum(prices[i-period+1:i+1]) / period
            sma.append(avg)
    return sma

def _calculate_rsi(self, prices: List[float], period: int = 14) -> List[Optional[float]]:
    """Calculate Relative Strength Index"""
    if len(prices) < period + 1:
        return [None] * len(prices)

    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]

    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]

    rsi_values = [None]  # First value is None

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(deltas)):
        if avg_loss == 0:
            rsi_values.append(100)
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            rsi_values.append(rsi)

        # Update averages
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    # Pad to match original length
    while len(rsi_values) < len(prices):
        rsi_values.append(None)

    return rsi_values

def _calculate_macd(self, prices: List[float]) -> Dict:
    """Calculate MACD (12, 26, 9)"""
    ema_12 = self._calculate_ema(prices, 12)
    ema_26 = self._calculate_ema(prices, 26)

    macd_line = [ema_12[i] - ema_26[i] if ema_12[i] and ema_26[i] else None
                 for i in range(len(prices))]

    signal_line = self._calculate_ema([m for m in macd_line if m is not None], 9)

    # Pad signal line
    signal_padded = [None] * (len(macd_line) - len(signal_line)) + signal_line

    histogram = [macd_line[i] - signal_padded[i] if macd_line[i] and signal_padded[i] else None
                 for i in range(len(macd_line))]

    return {
        "macd_line": macd_line,
        "signal_line": signal_padded,
        "histogram": histogram
    }

def _calculate_ema(self, prices: List[float], period: int) -> List[Optional[float]]:
    """Calculate Exponential Moving Average"""
    if len(prices) < period:
        return [None] * len(prices)

    multiplier = 2 / (period + 1)
    ema = [None] * (period - 1)

    # First EMA is SMA
    ema.append(sum(prices[:period]) / period)

    for i in range(period, len(prices)):
        ema_value = (prices[i] - ema[-1]) * multiplier + ema[-1]
        ema.append(ema_value)

    return ema
```

#### Step 1.5: Test Backend

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test endpoints (in another terminal)
curl http://localhost:8000/api/v1/market/intraday/AAPL?interval=5min
curl http://localhost:8000/api/v1/market/company/AAPL
curl http://localhost:8000/api/v1/market/technical/AAPL?indicators=SMA&indicators=RSI
```

---

### PHASE 2: Frontend API Layer (1 day)

#### Step 2.1: Extend Market API Client

**File:** `frontend/lib/api/market.ts`

Add these functions:

```typescript
export const marketApi = {
  // ... existing functions ...

  getIntradayData: async (ticker: string, interval: string = '5min') => {
    const response = await apiClient.get(`/market/intraday/${ticker}`, {
      params: { interval },
    });
    return response.data;
  },

  getCompanyOverview: async (ticker: string) => {
    const response = await apiClient.get(`/market/company/${ticker}`);
    return response.data;
  },

  getTechnicalIndicators: async (ticker: string, indicators: string[] = ['SMA', 'RSI']) => {
    const response = await apiClient.get(`/market/technical/${ticker}`, {
      params: { indicators },
    });
    return response.data;
  },
};
```

#### Step 2.2: Add Custom Hooks

**File:** `frontend/lib/hooks/useMarket.ts`

Add these hooks:

```typescript
export function useIntradayData(ticker: string, interval: string = '5min') {
  return useQuery({
    queryKey: ['intraday', ticker, interval],
    queryFn: () => marketApi.getIntradayData(ticker, interval),
    refetchInterval: 15000, // 15 seconds
    enabled: !!ticker,
    staleTime: 10000, // 10 seconds
  });
}

export function useCompanyOverview(ticker: string) {
  return useQuery({
    queryKey: ['company', ticker],
    queryFn: () => marketApi.getCompanyOverview(ticker),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!ticker,
  });
}

export function useTechnicalIndicators(ticker: string, indicators: string[] = ['SMA', 'RSI']) {
  return useQuery({
    queryKey: ['technical', ticker, indicators],
    queryFn: () => marketApi.getTechnicalIndicators(ticker, indicators),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!ticker && indicators.length > 0,
  });
}
```

---

### PHASE 3: Frontend Components (2-3 days)

#### Step 3.1: Stock Search Component

**File:** `frontend/components/markets/stock-search.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useStockSearch } from '@/lib/hooks/useMarket';

interface StockSearchProps {
  onSelectStock: (ticker: string) => void;
}

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data: results, isLoading } = useStockSearch(query);

  const handleSelect = (ticker: string) => {
    onSelectStock(ticker);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search stocks..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {showResults && query && results && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleSelect(stock.ticker)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-700 border-b border-gray-100 dark:border-neutral-700 last:border-b-0"
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {stock.ticker}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stock.name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Step 3.2: Company Info Card

**File:** `frontend/components/markets/company-info-card.tsx`

```typescript
'use client';

import { useCompanyOverview } from '@/lib/hooks/useMarket';

interface CompanyInfoCardProps {
  ticker: string;
}

export function CompanyInfoCard({ ticker }: CompanyInfoCardProps) {
  const { data: company, isLoading } = useCompanyOverview(ticker);

  if (isLoading) {
    return <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">Loading...</div>;
  }

  if (!company) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Company Info
      </h3>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Company Name</div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {company.name}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sector</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.sector || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Industry</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.industry || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              ${(company.market_cap / 1e9).toFixed(2)}B
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.pe_ratio ? company.pe_ratio.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">EPS</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              ${company.eps ? company.eps.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dividend Yield</div>
            <div className="text-base font-medium text-gray-900 dark:text-white">
              {company.dividend_yield ? (company.dividend_yield * 100).toFixed(2) + '%' : 'N/A'}
            </div>
          </div>
        </div>

        {company.description && (
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
              {company.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### Step 3.3: Market Movers Table

**File:** `frontend/components/markets/market-movers-table.tsx`

```typescript
'use client';

import { useTopGainers, useTopLosers, useMostActive } from '@/lib/hooks/useScreener';
import { PriceChange } from '@/components/ui/price-change';

export function MarketMoversTable() {
  const { data: gainers } = useTopGainers(10);
  const { data: losers } = useTopLosers(10);
  const { data: active } = useMostActive(10);

  const renderTable = (title: string, data: any[] | undefined, isGainers = false) => (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {data?.slice(0, 5).map((stock) => (
          <div key={stock.ticker} className="flex items-center justify-between">
            <div className="font-medium text-gray-900 dark:text-white">
              {stock.ticker}
            </div>
            <PriceChange change={stock.change} changePercent={stock.change_percent} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderTable('Top Gainers', gainers, true)}
      {renderTable('Top Losers', losers)}
      {renderTable('Most Active', active)}
    </div>
  );
}
```

#### Step 3.4: Intraday Chart with Technical Indicators

**File:** `frontend/components/markets/intraday-chart.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useIntradayData, useTechnicalIndicators } from '@/lib/hooks/useMarket';
import { CandlestickChart } from '@/components/charts/candlestick-chart';

interface IntradayChartProps {
  ticker: string;
}

export function IntradayChart({ ticker }: IntradayChartProps) {
  const [interval, setInterval] = useState('5min');
  const [showIndicators, setShowIndicators] = useState(false);

  const { data: intradayData, isLoading } = useIntradayData(ticker, interval);
  const { data: indicators } = useTechnicalIndicators(
    ticker,
    showIndicators ? ['SMA', 'RSI'] : []
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {ticker} - Intraday Chart
        </h3>

        <div className="flex gap-2">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="1min">1 min</option>
            <option value="5min">5 min</option>
            <option value="15min">15 min</option>
            <option value="30min">30 min</option>
            <option value="60min">1 hour</option>
          </select>

          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              showIndicators
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white'
            }`}
          >
            Indicators
          </button>
        </div>
      </div>

      <CandlestickChart data={intradayData} showVolume={true} />
    </div>
  );
}
```

---

### PHASE 4: Main Page (1 day)

#### Step 4.1: Create Markets Page

**File:** `frontend/app/markets/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { StockSearch } from '@/components/markets/stock-search';
import { CompanyInfoCard } from '@/components/markets/company-info-card';
import { MarketMoversTable } from '@/components/markets/market-movers-table';
import { IntradayChart } from '@/components/markets/intraday-chart';
import { useMarketIndices, useQuote } from '@/lib/hooks/useMarket';
import { MetricCard } from '@/components/ui/metric-card';

export default function MarketsPage() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const { data: indices } = useMarketIndices();
  const { data: quote } = useQuote(selectedTicker);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Markets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time market data and stock analysis
          </p>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices?.map((index) => (
            <MetricCard
              key={index.symbol}
              label={index.name}
              value={`$${index.price.toFixed(2)}`}
              change={index.change}
              changePercent={index.changePercent}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Market Movers */}
          <div className="lg:col-span-1">
            <MarketMoversTable />
          </div>

          {/* Right Panel - Stock Detail */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
              <StockSearch onSelectStock={setSelectedTicker} />
            </div>

            {/* Current Quote */}
            {quote && (
              <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTicker}
                  </h2>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${quote.price.toFixed(2)}
                  </div>
                  <div className={`text-lg ${quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      ${quote.open?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      ${quote.high?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Low</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      ${quote.low?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {quote.volume ? (quote.volume / 1e6).toFixed(2) + 'M' : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <IntradayChart ticker={selectedTicker} />

            {/* Company Info */}
            <CompanyInfoCard ticker={selectedTicker} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

- [ ] Backend endpoints return data for AAPL, MSFT, GOOGL
- [ ] Intraday data updates every 15 seconds
- [ ] Company overview displays correctly
- [ ] Technical indicators calculate without errors
- [ ] Stock search autocomplete works
- [ ] Chart renders candlesticks properly
- [ ] Market movers tables populate
- [ ] Page is responsive on mobile
- [ ] Dark mode works correctly
- [ ] Loading states show while fetching

---

## 🚀 Running the Page

1. **Start backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to:** `http://localhost:3000/markets`

---

## 🐛 Common Issues

**Issue:** "Module not found" errors
**Fix:** Make sure all imports are correct and files are in the right directories

**Issue:** API returns 404
**Fix:** Check that backend endpoints are registered and server is running

**Issue:** Charts not rendering
**Fix:** Verify data format matches what CandlestickChart expects

**Issue:** Real-time updates not working
**Fix:** Check refetchInterval is set in useQuery hooks

---

## 📝 Notes

- DO NOT modify sidebar.tsx (another task will add the navigation link)
- Reuse existing chart components where possible
- Follow existing code patterns in the codebase
- Use TypeScript for type safety
- Add proper error handling and loading states
