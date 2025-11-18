# Build Instructions: Analysis Page

**Page Route:** `/analysis`
**Estimated Time:** 7-9 days
**Priority:** Advanced Feature

---

## 🎯 Goal

Build a complete Analysis page with advanced portfolio risk metrics, correlation analysis, performance attribution, and benchmark comparison.

---

## 📋 Step-by-Step Instructions

### PHASE 1: Backend Service (3-4 days)

#### Step 1.1: Create Analysis Service

**File:** `backend/app/services/analysis_service.py` (NEW FILE)

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.services.market_service import MarketService
from app.services.portfolio_service import PortfolioService


class AnalysisService:
    """Advanced portfolio and market analysis"""

    def __init__(self, db: Session):
        self.db = db
        self.market_service = MarketService(db)
        self.portfolio_service = PortfolioService(db)

    def calculate_correlation_matrix(
        self,
        tickers: List[str],
        period: str = "6M"
    ) -> Dict[str, Dict[str, float]]:
        """Calculate correlation matrix between assets"""
        # Fetch historical data for all tickers
        price_data = {}

        for ticker in tickers:
            chart_data = self.market_service.get_chart_data(ticker, period)
            if chart_data and chart_data.data:
                prices = [point["value"] for point in chart_data.data]
                price_data[ticker] = prices

        # Ensure all arrays are same length (use shortest)
        min_length = min(len(prices) for prices in price_data.values())
        for ticker in price_data:
            price_data[ticker] = price_data[ticker][:min_length]

        # Calculate correlation matrix
        df = pd.DataFrame(price_data)
        corr_matrix = df.corr()

        # Convert to nested dict
        result = {}
        for ticker1 in tickers:
            result[ticker1] = {}
            for ticker2 in tickers:
                if ticker1 in corr_matrix.columns and ticker2 in corr_matrix.columns:
                    result[ticker1][ticker2] = float(corr_matrix.loc[ticker1, ticker2])
                else:
                    result[ticker1][ticker2] = 0.0

        return result

    def calculate_portfolio_risk_metrics(
        self,
        portfolio_id: int
    ) -> Dict:
        """Calculate comprehensive risk metrics"""
        # Get portfolio positions
        positions = self.portfolio_service.get_positions(portfolio_id)

        if not positions:
            return {}

        # Get historical returns for portfolio and market (SPY)
        portfolio_returns = self._get_portfolio_returns(portfolio_id)
        market_returns = self._get_market_returns("SPY")

        # Align lengths
        min_length = min(len(portfolio_returns), len(market_returns))
        portfolio_returns = portfolio_returns[:min_length]
        market_returns = market_returns[:min_length]

        # Calculate metrics
        beta = self._calculate_beta(portfolio_returns, market_returns)
        sharpe = self._calculate_sharpe_ratio(portfolio_returns)
        sortino = self._calculate_sortino_ratio(portfolio_returns)
        max_dd = self._calculate_max_drawdown(portfolio_returns)
        var_95 = self._calculate_var(portfolio_returns, 0.95)
        volatility = np.std(portfolio_returns) * np.sqrt(252) * 100

        return {
            "beta": round(beta, 2),
            "sharpe_ratio": round(sharpe, 2),
            "sortino_ratio": round(sortino, 2),
            "max_drawdown_pct": round(max_dd * 100, 2),
            "var_95_pct": round(var_95 * 100, 2),
            "volatility_annual_pct": round(volatility, 2)
        }

    def calculate_performance_attribution(
        self,
        portfolio_id: int,
        period: str = "1Y"
    ) -> Dict:
        """Breakdown performance by sector and position"""
        positions = self.portfolio_service.get_positions(portfolio_id)

        if not positions:
            return {"by_sector": {}, "by_position": []}

        # Group by sector and calculate contribution
        sector_contribution = {}
        position_contribution = []

        for position in positions:
            # Get price change for period
            chart_data = self.market_service.get_chart_data(position.ticker, period)

            if not chart_data or not chart_data.data or len(chart_data.data) < 2:
                continue

            start_price = chart_data.data[0]["value"]
            end_price = chart_data.data[-1]["value"]
            price_change_pct = ((end_price - start_price) / start_price) * 100

            # Get company info for sector
            quote = self.market_service.get_quote(position.ticker)
            sector = "Unknown"  # You might get this from company overview

            # Weight by position value
            weight = (position.quantity * position.avg_price) / 100000  # Assuming portfolio value
            contribution = price_change_pct * weight

            # Add to sector
            if sector not in sector_contribution:
                sector_contribution[sector] = 0
            sector_contribution[sector] += contribution

            # Add to positions
            position_contribution.append({
                "ticker": position.ticker,
                "contribution_pct": round(contribution, 2),
                "return_pct": round(price_change_pct, 2)
            })

        # Sort positions by contribution
        position_contribution.sort(key=lambda x: abs(x["contribution_pct"]), reverse=True)

        return {
            "by_sector": sector_contribution,
            "by_position": position_contribution[:10]  # Top 10
        }

    def compare_to_benchmark(
        self,
        portfolio_id: int,
        benchmark: str = "SPY",
        period: str = "1Y"
    ) -> Dict:
        """Compare portfolio performance to benchmark"""
        # Get portfolio and benchmark returns
        portfolio_returns = self._get_portfolio_returns(portfolio_id, period)
        benchmark_returns = self._get_market_returns(benchmark, period)

        # Calculate cumulative returns
        portfolio_cumulative = self._cumulative_returns(portfolio_returns)
        benchmark_cumulative = self._cumulative_returns(benchmark_returns)

        # Calculate total return
        portfolio_total = (portfolio_cumulative[-1] - 1) * 100 if portfolio_cumulative else 0
        benchmark_total = (benchmark_cumulative[-1] - 1) * 100 if benchmark_cumulative else 0

        alpha = portfolio_total - benchmark_total

        return {
            "portfolio_return_pct": round(portfolio_total, 2),
            "benchmark_return_pct": round(benchmark_total, 2),
            "alpha_pct": round(alpha, 2),
            "portfolio_chart": [{"date": i, "value": v * 100} for i, v in enumerate(portfolio_cumulative)],
            "benchmark_chart": [{"date": i, "value": v * 100} for i, v in enumerate(benchmark_cumulative)]
        }

    def calculate_diversification_score(
        self,
        portfolio_id: int
    ) -> Dict:
        """Calculate diversification score (0-100)"""
        positions = self.portfolio_service.get_positions(portfolio_id)

        if not positions:
            return {"score": 0, "breakdown": {}}

        # Calculate total value
        total_value = sum(p.quantity * p.avg_price for p in positions)

        # Calculate concentration metrics
        position_weights = [(p.quantity * p.avg_price) / total_value for p in positions]

        # Herfindahl index (lower is better)
        herfindahl = sum(w ** 2 for w in position_weights)

        # Convert to score (0-100, where 100 is perfectly diversified)
        # Perfect diversification = 1/N, worst = 1
        n = len(positions)
        perfect_herf = 1 / n if n > 0 else 1
        score = (1 - (herfindahl - perfect_herf) / (1 - perfect_herf)) * 100
        score = max(0, min(100, score))

        # Breakdown
        max_position = max(position_weights) * 100 if position_weights else 0

        concentration = "Low" if max_position < 20 else "Medium" if max_position < 40 else "High"

        return {
            "score": round(score, 0),
            "breakdown": {
                "position_count": n,
                "max_position_pct": round(max_position, 2),
                "concentration": concentration,
                "herfindahl_index": round(herfindahl, 4)
            }
        }

    # Helper methods

    def _get_portfolio_returns(self, portfolio_id: int, period: str = "1Y") -> List[float]:
        """Get historical returns for portfolio"""
        # This is simplified - ideally you'd calculate based on all positions
        positions = self.portfolio_service.get_positions(portfolio_id)

        if not positions:
            return []

        # Use first position as proxy (simplification)
        ticker = positions[0].ticker
        chart_data = self.market_service.get_chart_data(ticker, period)

        if not chart_data or not chart_data.data:
            return []

        prices = [point["value"] for point in chart_data.data]
        returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]

        return returns

    def _get_market_returns(self, ticker: str = "SPY", period: str = "1Y") -> List[float]:
        """Get market returns for benchmark"""
        chart_data = self.market_service.get_chart_data(ticker, period)

        if not chart_data or not chart_data.data:
            return []

        prices = [point["value"] for point in chart_data.data]
        returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]

        return returns

    def _calculate_beta(self, portfolio_returns: List[float], market_returns: List[float]) -> float:
        """Calculate portfolio beta"""
        if not portfolio_returns or not market_returns:
            return 1.0

        covariance = np.cov(portfolio_returns, market_returns)[0][1]
        market_variance = np.var(market_returns)

        if market_variance == 0:
            return 1.0

        return covariance / market_variance

    def _calculate_sharpe_ratio(self, returns: List[float], risk_free_rate: float = 0.04) -> float:
        """Calculate Sharpe ratio"""
        if not returns:
            return 0.0

        excess_returns = np.array(returns) - (risk_free_rate / 252)

        if np.std(excess_returns) == 0:
            return 0.0

        return np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)

    def _calculate_sortino_ratio(self, returns: List[float], risk_free_rate: float = 0.04) -> float:
        """Calculate Sortino ratio"""
        if not returns:
            return 0.0

        excess_returns = np.array(returns) - (risk_free_rate / 252)
        downside_returns = excess_returns[excess_returns < 0]

        if len(downside_returns) == 0 or np.std(downside_returns) == 0:
            return 0.0

        return np.mean(excess_returns) / np.std(downside_returns) * np.sqrt(252)

    def _calculate_max_drawdown(self, returns: List[float]) -> float:
        """Calculate maximum drawdown"""
        if not returns:
            return 0.0

        cumulative = self._cumulative_returns(returns)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max

        return abs(np.min(drawdown))

    def _calculate_var(self, returns: List[float], confidence: float = 0.95) -> float:
        """Calculate Value at Risk"""
        if not returns:
            return 0.0

        return np.percentile(returns, (1 - confidence) * 100)

    def _cumulative_returns(self, returns: List[float]) -> List[float]:
        """Calculate cumulative returns"""
        if not returns:
            return [1.0]

        cumulative = [1.0]
        for r in returns:
            cumulative.append(cumulative[-1] * (1 + r))

        return cumulative
```

#### Step 1.2: Create Analysis Router

**File:** `backend/app/api/v1/analysis.py` (NEW FILE)

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/correlation")
def get_correlation_matrix(
    tickers: str = Query(..., description="Comma-separated ticker symbols"),
    period: str = "6M",
    db: Session = Depends(get_db)
):
    """Get correlation matrix for assets"""
    analysis_service = AnalysisService(db)
    ticker_list = [t.strip().upper() for t in tickers.split(",")]

    return analysis_service.calculate_correlation_matrix(ticker_list, period)


@router.get("/portfolio/{portfolio_id}/risk")
def get_portfolio_risk_metrics(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive risk metrics for portfolio"""
    analysis_service = AnalysisService(db)

    return analysis_service.calculate_portfolio_risk_metrics(portfolio_id)


@router.get("/portfolio/{portfolio_id}/attribution")
def get_performance_attribution(
    portfolio_id: int,
    period: str = "1Y",
    db: Session = Depends(get_db)
):
    """Get performance attribution by sector and position"""
    analysis_service = AnalysisService(db)

    return analysis_service.calculate_performance_attribution(portfolio_id, period)


@router.get("/portfolio/{portfolio_id}/benchmark")
def compare_to_benchmark(
    portfolio_id: int,
    benchmark: str = "SPY",
    period: str = "1Y",
    db: Session = Depends(get_db)
):
    """Compare portfolio performance to benchmark"""
    analysis_service = AnalysisService(db)

    return analysis_service.compare_to_benchmark(portfolio_id, benchmark, period)


@router.get("/portfolio/{portfolio_id}/diversification")
def get_diversification_metrics(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """Get diversification score and metrics"""
    analysis_service = AnalysisService(db)

    return analysis_service.calculate_diversification_score(portfolio_id)
```

#### Step 1.3: Register Router

**File:** `backend/app/main.py`

Add these lines:

```python
from app.api.v1 import analysis

# ... existing code ...

app.include_router(analysis.router, prefix="/api/v1")
```

#### Step 1.4: Test Backend

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test endpoints
curl "http://localhost:8000/api/v1/analysis/correlation?tickers=AAPL,MSFT,GOOGL&period=6M"
curl http://localhost:8000/api/v1/analysis/portfolio/1/risk
curl http://localhost:8000/api/v1/analysis/portfolio/1/attribution
curl "http://localhost:8000/api/v1/analysis/portfolio/1/benchmark?benchmark=SPY"
curl http://localhost:8000/api/v1/analysis/portfolio/1/diversification
```

---

### PHASE 2: Frontend API Layer (1 day)

#### Step 2.1: Create Analysis API Client

**File:** `frontend/lib/api/analysis.ts` (NEW FILE)

```typescript
import { apiClient } from './client';

export const analysisApi = {
  getCorrelationMatrix: async (tickers: string[], period: string = '6M') => {
    const response = await apiClient.get('/analysis/correlation', {
      params: {
        tickers: tickers.join(','),
        period,
      },
    });
    return response.data;
  },

  getPortfolioRiskMetrics: async (portfolioId: number) => {
    const response = await apiClient.get(`/analysis/portfolio/${portfolioId}/risk`);
    return response.data;
  },

  getPerformanceAttribution: async (portfolioId: number, period: string = '1Y') => {
    const response = await apiClient.get(`/analysis/portfolio/${portfolioId}/attribution`, {
      params: { period },
    });
    return response.data;
  },

  compareToBenchmark: async (
    portfolioId: number,
    benchmark: string = 'SPY',
    period: string = '1Y'
  ) => {
    const response = await apiClient.get(`/analysis/portfolio/${portfolioId}/benchmark`, {
      params: { benchmark, period },
    });
    return response.data;
  },

  getDiversificationMetrics: async (portfolioId: number) => {
    const response = await apiClient.get(`/analysis/portfolio/${portfolioId}/diversification`);
    return response.data;
  },
};
```

#### Step 2.2: Create Analysis Hooks

**File:** `frontend/lib/hooks/useAnalysis.ts` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api/analysis';

export function useCorrelationMatrix(tickers: string[], period: string = '6M') {
  return useQuery({
    queryKey: ['correlation', tickers, period],
    queryFn: () => analysisApi.getCorrelationMatrix(tickers, period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: tickers.length > 1,
  });
}

export function usePortfolioRiskMetrics(portfolioId: number) {
  return useQuery({
    queryKey: ['portfolio-risk', portfolioId],
    queryFn: () => analysisApi.getPortfolioRiskMetrics(portfolioId),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    enabled: !!portfolioId,
  });
}

export function usePerformanceAttribution(portfolioId: number, period: string = '1Y') {
  return useQuery({
    queryKey: ['attribution', portfolioId, period],
    queryFn: () => analysisApi.getPerformanceAttribution(portfolioId, period),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!portfolioId,
  });
}

export function useBenchmarkComparison(
  portfolioId: number,
  benchmark: string = 'SPY',
  period: string = '1Y'
) {
  return useQuery({
    queryKey: ['benchmark', portfolioId, benchmark, period],
    queryFn: () => analysisApi.compareToBenchmark(portfolioId, benchmark, period),
    staleTime: 30 * 60 * 1000,
    enabled: !!portfolioId,
  });
}

export function useDiversificationMetrics(portfolioId: number) {
  return useQuery({
    queryKey: ['diversification', portfolioId],
    queryFn: () => analysisApi.getDiversificationMetrics(portfolioId),
    staleTime: 10 * 60 * 1000,
    enabled: !!portfolioId,
  });
}
```

---

### PHASE 3: Frontend Components (2-3 days)

#### Step 3.1: Risk Metrics Dashboard

**File:** `frontend/components/analysis/risk-metrics-dashboard.tsx`

```typescript
'use client';

import { usePortfolioRiskMetrics } from '@/lib/hooks/useAnalysis';

interface RiskMetricsDashboardProps {
  portfolioId: number;
}

export function RiskMetricsDashboard({ portfolioId }: RiskMetricsDashboardProps) {
  const { data: metrics, isLoading } = usePortfolioRiskMetrics(portfolioId);

  if (isLoading) {
    return <div>Loading risk metrics...</div>;
  }

  if (!metrics) {
    return null;
  }

  const metricCards = [
    { label: 'Beta', value: metrics.beta, tooltip: 'Volatility relative to market (1.0 = market)' },
    { label: 'Sharpe Ratio', value: metrics.sharpe_ratio, tooltip: 'Risk-adjusted return' },
    { label: 'Sortino Ratio', value: metrics.sortino_ratio, tooltip: 'Downside risk-adjusted return' },
    { label: 'Max Drawdown', value: `${metrics.max_drawdown_pct}%`, tooltip: 'Largest peak-to-trough decline' },
    { label: 'VaR (95%)', value: `${metrics.var_95_pct}%`, tooltip: '95% confidence loss limit' },
    { label: 'Volatility', value: `${metrics.volatility_annual_pct}%`, tooltip: 'Annual volatility' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Risk Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricCards.map((metric) => (
          <div key={metric.label} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400" title={metric.tooltip}>
              {metric.label}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Step 3.2: Benchmark Comparison

**File:** `frontend/components/analysis/benchmark-comparison.tsx`

```typescript
'use client';

import { useBenchmarkComparison } from '@/lib/hooks/useAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BenchmarkComparisonProps {
  portfolioId: number;
  benchmark?: string;
  period?: string;
}

export function BenchmarkComparison({ portfolioId, benchmark = 'SPY', period = '1Y' }: BenchmarkComparisonProps) {
  const { data, isLoading } = useBenchmarkComparison(portfolioId, benchmark, period);

  if (isLoading) {
    return <div>Loading comparison...</div>;
  }

  if (!data) {
    return null;
  }

  // Combine data for chart
  const chartData = data.portfolio_chart.map((point, index) => ({
    date: point.date,
    portfolio: point.value,
    benchmark: data.benchmark_chart[index]?.value || 0,
  }));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio vs {benchmark}
          </h3>
          <div className="flex gap-4 mt-2">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Portfolio Return</div>
              <div className={`text-xl font-bold ${data.portfolio_return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.portfolio_return_pct >= 0 ? '+' : ''}{data.portfolio_return_pct}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{benchmark} Return</div>
              <div className={`text-xl font-bold ${data.benchmark_return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.benchmark_return_pct >= 0 ? '+' : ''}{data.benchmark_return_pct}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alpha</div>
              <div className={`text-xl font-bold ${data.alpha_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.alpha_pct >= 0 ? '+' : ''}{data.alpha_pct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Line type="monotone" dataKey="portfolio" stroke="#3B82F6" strokeWidth={2} name="Portfolio" />
          <Line type="monotone" dataKey="benchmark" stroke="#10B981" strokeWidth={2} name={benchmark} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Step 3.3: Diversification Score

**File:** `frontend/components/analysis/diversification-score.tsx`

```typescript
'use client';

import { useDiversificationMetrics } from '@/lib/hooks/useAnalysis';

interface DiversificationScoreProps {
  portfolioId: number;
}

export function DiversificationScore({ portfolioId }: DiversificationScoreProps) {
  const { data, isLoading } = useDiversificationMetrics(portfolioId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return null;
  }

  const scoreColor = data.score >= 70 ? 'text-green-600' : data.score >= 40 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Diversification Score
      </h3>

      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${scoreColor}`}>
          {data.score}/100
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Position Count</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.breakdown.position_count}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Largest Position</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.breakdown.max_position_pct}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Concentration</span>
          <span className={`font-semibold ${
            data.breakdown.concentration === 'Low' ? 'text-green-600' :
            data.breakdown.concentration === 'Medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {data.breakdown.concentration}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

### PHASE 4: Main Page (1 day)

**File:** `frontend/app/analysis/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { usePortfolios } from '@/lib/hooks/usePortfolio';
import { useCorrelationMatrix } from '@/lib/hooks/useAnalysis';
import { RiskMetricsDashboard } from '@/components/analysis/risk-metrics-dashboard';
import { BenchmarkComparison } from '@/components/analysis/benchmark-comparison';
import { DiversificationScore } from '@/components/analysis/diversification-score';
import { CorrelationMatrix } from '@/components/charts/correlation-matrix';

export default function AnalysisPage() {
  const { data: portfolios } = usePortfolios();
  const [selectedPortfolio, setSelectedPortfolio] = useState(1);

  // Get tickers from portfolio (simplified - you'd get from positions)
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'SPY'];
  const { data: correlation } = useCorrelationMatrix(tickers, '6M');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced portfolio analytics and risk metrics
            </p>
          </div>

          {/* Portfolio Selector */}
          <select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
          >
            {portfolios?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Metrics & Benchmark Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskMetricsDashboard portfolioId={selectedPortfolio} />
          <BenchmarkComparison portfolioId={selectedPortfolio} />
        </div>

        {/* Correlation Matrix */}
        {correlation && (
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Asset Correlation Matrix
            </h3>
            <CorrelationMatrix data={correlation} />
          </div>
        )}

        {/* Diversification */}
        <DiversificationScore portfolioId={selectedPortfolio} />
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

- [ ] Backend endpoints return valid data
- [ ] Risk metrics calculate correctly (Beta, Sharpe, etc.)
- [ ] Correlation matrix displays properly
- [ ] Benchmark comparison chart renders
- [ ] Diversification score shows correctly
- [ ] Portfolio selector works
- [ ] Page is responsive
- [ ] Dark mode works
- [ ] Loading states display

---

## 🚀 Running the Page

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to: `http://localhost:3000/analysis`

---

## 📝 Notes

- Requires numpy and pandas in backend
- DO NOT modify sidebar.tsx
- Reuse existing CorrelationMatrix chart component
- Add tooltips to explain financial metrics
- Consider caching expensive calculations
