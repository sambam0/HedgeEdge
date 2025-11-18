import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.services.market_service import market_service
from app.models.models import Portfolio, Position


class AnalysisService:
    """Advanced portfolio and market analysis service"""

    def __init__(self, db: Session):
        self.db = db
        self.risk_free_rate = 0.04  # 4% annual risk-free rate

    def calculate_correlation_matrix(
        self,
        tickers: List[str],
        period: str = "6M"
    ) -> Dict:
        """Calculate correlation matrix between assets"""
        try:
            # Map period to number of days
            period_map = {
                "1M": 30, "3M": 90, "6M": 180, "1Y": 252
            }
            days = period_map.get(period, 180)

            # Fetch historical data for all tickers
            price_data = {}
            for ticker in tickers:
                chart_data = market_service.get_chart_data(ticker, period)
                if chart_data and len(chart_data.close) > 0:
                    price_data[ticker] = chart_data.close

            if len(price_data) < 2:
                return {
                    "assets": tickers,
                    "data": [],
                    "error": "Insufficient data"
                }

            # Create DataFrame
            df = pd.DataFrame(price_data)

            # Calculate daily returns
            returns = df.pct_change().dropna()

            # Calculate correlation matrix
            corr_matrix = returns.corr()

            # Format for frontend
            assets = list(corr_matrix.columns)
            data = []

            for asset in assets:
                row_data = {"asset": asset}
                for col in assets:
                    row_data[col] = round(corr_matrix.loc[asset, col], 3)
                data.append(row_data)

            return {
                "assets": assets,
                "data": data,
                "period": period
            }

        except Exception as e:
            print(f"Error calculating correlation matrix: {e}")
            return {
                "assets": tickers,
                "data": [],
                "error": str(e)
            }

    def calculate_portfolio_risk_metrics(
        self,
        portfolio_id: int
    ) -> Dict:
        """Calculate comprehensive risk metrics for a portfolio"""
        try:
            # Get portfolio and positions
            portfolio = self.db.query(Portfolio).filter(
                Portfolio.id == portfolio_id
            ).first()

            if not portfolio or not portfolio.positions:
                return {
                    "error": "Portfolio not found or has no positions"
                }

            positions = portfolio.positions

            # Get portfolio returns and market returns
            portfolio_returns, market_returns, portfolio_values = self._get_portfolio_returns(
                positions, period="1Y"
            )

            if len(portfolio_returns) < 30:
                return {
                    "error": "Insufficient historical data (need at least 30 days)"
                }

            # Calculate metrics
            beta = self._calculate_beta(portfolio_returns, market_returns)
            sharpe = self._calculate_sharpe_ratio(portfolio_returns)
            sortino = self._calculate_sortino_ratio(portfolio_returns)
            max_dd = self._calculate_max_drawdown(portfolio_values)
            var_95 = self._calculate_var(portfolio_returns, 0.95)
            volatility = self._calculate_volatility(portfolio_returns)

            return {
                "beta": round(beta, 3),
                "sharpe_ratio": round(sharpe, 3),
                "sortino_ratio": round(sortino, 3),
                "max_drawdown": round(max_dd["max_drawdown_pct"], 2),
                "var_95": round(var_95 * 100, 2),  # Convert to percentage
                "volatility": round(volatility * 100, 2),  # Annualized volatility %
                "risk_free_rate": self.risk_free_rate
            }

        except Exception as e:
            print(f"Error calculating risk metrics: {e}")
            return {"error": str(e)}

    def calculate_performance_attribution(
        self,
        portfolio_id: int,
        period: str = "1Y"
    ) -> Dict:
        """Calculate performance attribution by sector and position"""
        try:
            portfolio = self.db.query(Portfolio).filter(
                Portfolio.id == portfolio_id
            ).first()

            if not portfolio or not portfolio.positions:
                return {"error": "Portfolio not found or has no positions"}

            positions = portfolio.positions

            # Calculate contribution by position
            position_contributions = []
            total_return = 0

            for position in positions:
                ticker = position.ticker
                shares = float(position.shares)
                cost_basis = float(position.cost_basis)

                # Get current price
                quote = market_service.get_quote(ticker)
                current_price = quote.price if quote else cost_basis

                # Calculate position metrics
                position_value = shares * current_price
                position_cost = shares * cost_basis
                position_return = ((position_value - position_cost) / position_cost * 100) if position_cost > 0 else 0

                position_contributions.append({
                    "ticker": ticker,
                    "return": round(position_return, 2),
                    "value": round(position_value, 2),
                    "weight": 0  # Will calculate after getting total
                })

                total_return += position_return

            # Calculate weights
            total_value = sum(p["value"] for p in position_contributions)
            for contrib in position_contributions:
                contrib["weight"] = round((contrib["value"] / total_value * 100) if total_value > 0 else 0, 2)
                contrib["weighted_return"] = round(contrib["return"] * contrib["weight"] / 100, 2)

            # Sort by contribution
            position_contributions.sort(key=lambda x: x["weighted_return"], reverse=True)

            # Group by sector (simplified - using ticker prefix as proxy)
            # In production, would use actual sector data
            sector_map = {
                "AAPL": "Technology", "MSFT": "Technology", "GOOGL": "Technology",
                "AMZN": "Technology", "TSLA": "Consumer Cyclical", "META": "Technology",
                "NVDA": "Technology", "AMD": "Technology", "JPM": "Financial",
                "BAC": "Financial", "WMT": "Consumer Defensive", "V": "Financial",
                "MA": "Financial", "DIS": "Communication", "NFLX": "Communication",
                "PYPL": "Financial"
            }

            sector_contributions = {}
            for contrib in position_contributions:
                sector = sector_map.get(contrib["ticker"], "Other")
                if sector not in sector_contributions:
                    sector_contributions[sector] = {
                        "sector": sector,
                        "return": 0,
                        "weight": 0,
                        "count": 0
                    }
                sector_contributions[sector]["return"] += contrib["weighted_return"]
                sector_contributions[sector]["weight"] += contrib["weight"]
                sector_contributions[sector]["count"] += 1

            # Format sector data
            sector_data = list(sector_contributions.values())
            sector_data.sort(key=lambda x: x["return"], reverse=True)

            for sector in sector_data:
                sector["return"] = round(sector["return"], 2)
                sector["weight"] = round(sector["weight"], 2)

            return {
                "by_position": position_contributions[:10],  # Top 10
                "by_sector": sector_data,
                "period": period
            }

        except Exception as e:
            print(f"Error calculating performance attribution: {e}")
            return {"error": str(e)}

    def compare_to_benchmark(
        self,
        portfolio_id: int,
        benchmark: str = "^GSPC",
        period: str = "1Y"
    ) -> Dict:
        """Compare portfolio performance to benchmark"""
        try:
            portfolio = self.db.query(Portfolio).filter(
                Portfolio.id == portfolio_id
            ).first()

            if not portfolio or not portfolio.positions:
                return {"error": "Portfolio not found or has no positions"}

            # Get portfolio historical values
            positions = portfolio.positions
            portfolio_returns, _, portfolio_values = self._get_portfolio_returns(
                positions, period
            )

            # Get benchmark data
            benchmark_data = market_service.get_chart_data(benchmark, period)
            if not benchmark_data or len(benchmark_data.close) == 0:
                return {"error": "Benchmark data not available"}

            benchmark_prices = benchmark_data.close
            benchmark_returns = pd.Series(benchmark_prices).pct_change().dropna().tolist()

            # Align lengths
            min_len = min(len(portfolio_returns), len(benchmark_returns))
            portfolio_returns = portfolio_returns[-min_len:]
            benchmark_returns = benchmark_returns[-min_len:]
            portfolio_values = portfolio_values[-min_len:]
            benchmark_prices = benchmark_prices[-min_len:]

            # Calculate cumulative returns
            portfolio_cumulative = self._calculate_cumulative_returns(portfolio_returns)
            benchmark_cumulative = self._calculate_cumulative_returns(benchmark_returns)

            # Calculate metrics
            portfolio_total_return = (portfolio_cumulative[-1] - 1) * 100 if portfolio_cumulative else 0
            benchmark_total_return = (benchmark_cumulative[-1] - 1) * 100 if benchmark_cumulative else 0
            alpha = portfolio_total_return - benchmark_total_return

            # Format chart data
            timestamps = benchmark_data.timestamp[-min_len:]

            return {
                "portfolio_return": round(portfolio_total_return, 2),
                "benchmark_return": round(benchmark_total_return, 2),
                "alpha": round(alpha, 2),
                "benchmark_name": "S&P 500" if benchmark == "^GSPC" else benchmark,
                "chart_data": {
                    "timestamps": timestamps,
                    "portfolio": [round(v * 100, 2) for v in portfolio_cumulative],
                    "benchmark": [round(v * 100, 2) for v in benchmark_cumulative]
                },
                "period": period
            }

        except Exception as e:
            print(f"Error comparing to benchmark: {e}")
            return {"error": str(e)}

    def calculate_diversification_score(
        self,
        portfolio_id: int
    ) -> Dict:
        """Calculate diversification score and metrics"""
        try:
            portfolio = self.db.query(Portfolio).filter(
                Portfolio.id == portfolio_id
            ).first()

            if not portfolio or not portfolio.positions:
                return {"error": "Portfolio not found or has no positions"}

            positions = portfolio.positions

            # Calculate position weights
            total_value = 0
            weights = []

            for position in positions:
                quote = market_service.get_quote(position.ticker)
                if quote:
                    value = float(position.shares) * quote.price
                    total_value += value
                    weights.append(value)

            if total_value == 0:
                return {"error": "Portfolio has no value"}

            # Normalize weights
            weights = [w / total_value for w in weights]

            # Calculate Herfindahl-Hirschman Index (HHI)
            hhi = sum(w ** 2 for w in weights)

            # Calculate effective number of holdings
            effective_holdings = 1 / hhi if hhi > 0 else 0

            # Diversification score (0-100)
            # Perfect diversification would have HHI = 1/N where N is number of holdings
            ideal_hhi = 1 / len(positions)
            score = (1 - (hhi - ideal_hhi) / (1 - ideal_hhi)) * 100 if len(positions) > 1 else 50
            score = max(0, min(100, score))  # Clamp between 0-100

            # Position concentration analysis
            max_weight = max(weights) * 100 if weights else 0
            top3_weight = sum(sorted(weights, reverse=True)[:3]) * 100 if len(weights) >= 3 else 100

            # Concentration level
            if max_weight > 40:
                concentration = "High"
            elif max_weight > 25:
                concentration = "Medium"
            else:
                concentration = "Low"

            return {
                "score": round(score, 1),
                "total_positions": len(positions),
                "effective_holdings": round(effective_holdings, 2),
                "hhi": round(hhi, 4),
                "concentration_level": concentration,
                "largest_position_weight": round(max_weight, 2),
                "top3_positions_weight": round(top3_weight, 2)
            }

        except Exception as e:
            print(f"Error calculating diversification score: {e}")
            return {"error": str(e)}

    # Helper methods

    def _get_portfolio_returns(
        self,
        positions: List[Position],
        period: str = "1Y"
    ) -> tuple:
        """Get portfolio returns and market returns for a period"""
        # Get historical data for all positions
        position_data = {}

        for position in positions:
            chart_data = market_service.get_chart_data(position.ticker, period)
            if chart_data and len(chart_data.close) > 0:
                position_data[position.ticker] = {
                    "prices": chart_data.close,
                    "shares": float(position.shares)
                }

        if not position_data:
            return [], [], []

        # Find minimum length across all assets
        min_len = min(len(data["prices"]) for data in position_data.values())

        # Calculate portfolio values over time
        portfolio_values = []
        for i in range(min_len):
            total_value = 0
            for ticker, data in position_data.items():
                total_value += data["prices"][i] * data["shares"]
            portfolio_values.append(total_value)

        # Calculate portfolio returns
        portfolio_series = pd.Series(portfolio_values)
        portfolio_returns = portfolio_series.pct_change().dropna().tolist()

        # Get market returns (S&P 500)
        market_data = market_service.get_chart_data("^GSPC", period)
        if market_data and len(market_data.close) > 0:
            market_series = pd.Series(market_data.close[-min_len:])
            market_returns = market_series.pct_change().dropna().tolist()
        else:
            market_returns = [0] * len(portfolio_returns)

        return portfolio_returns, market_returns, portfolio_values

    def _calculate_beta(
        self,
        portfolio_returns: List[float],
        market_returns: List[float]
    ) -> float:
        """Calculate portfolio beta vs market"""
        if len(portfolio_returns) != len(market_returns) or len(portfolio_returns) < 2:
            return 1.0

        covariance = np.cov(portfolio_returns, market_returns)[0][1]
        market_variance = np.var(market_returns)

        return covariance / market_variance if market_variance > 0 else 1.0

    def _calculate_sharpe_ratio(
        self,
        returns: List[float]
    ) -> float:
        """Calculate Sharpe ratio"""
        if len(returns) < 2:
            return 0.0

        returns_arr = np.array(returns)
        daily_rf = self.risk_free_rate / 252  # Convert annual to daily
        excess_returns = returns_arr - daily_rf

        mean_excess = np.mean(excess_returns)
        std_excess = np.std(excess_returns)

        if std_excess == 0:
            return 0.0

        # Annualize
        sharpe = (mean_excess / std_excess) * np.sqrt(252)
        return sharpe

    def _calculate_sortino_ratio(
        self,
        returns: List[float]
    ) -> float:
        """Calculate Sortino ratio (using downside deviation)"""
        if len(returns) < 2:
            return 0.0

        returns_arr = np.array(returns)
        daily_rf = self.risk_free_rate / 252
        excess_returns = returns_arr - daily_rf

        # Downside deviation (only negative returns)
        downside_returns = excess_returns[excess_returns < 0]

        if len(downside_returns) == 0:
            return 0.0

        downside_std = np.std(downside_returns)

        if downside_std == 0:
            return 0.0

        mean_excess = np.mean(excess_returns)

        # Annualize
        sortino = (mean_excess / downside_std) * np.sqrt(252)
        return sortino

    def _calculate_max_drawdown(
        self,
        values: List[float]
    ) -> Dict:
        """Calculate maximum drawdown"""
        if len(values) < 2:
            return {"max_drawdown": 0, "max_drawdown_pct": 0}

        peak = values[0]
        max_dd = 0

        for value in values:
            if value > peak:
                peak = value
            dd = (peak - value) / peak if peak > 0 else 0
            if dd > max_dd:
                max_dd = dd

        return {
            "max_drawdown": max_dd,
            "max_drawdown_pct": max_dd * 100
        }

    def _calculate_var(
        self,
        returns: List[float],
        confidence: float = 0.95
    ) -> float:
        """Calculate Value at Risk"""
        if len(returns) < 2:
            return 0.0

        return np.percentile(returns, (1 - confidence) * 100)

    def _calculate_volatility(
        self,
        returns: List[float]
    ) -> float:
        """Calculate annualized volatility"""
        if len(returns) < 2:
            return 0.0

        return np.std(returns) * np.sqrt(252)  # Annualized

    def _calculate_cumulative_returns(
        self,
        returns: List[float]
    ) -> List[float]:
        """Calculate cumulative returns from daily returns"""
        cumulative = [1.0]
        for r in returns:
            cumulative.append(cumulative[-1] * (1 + r))
        return cumulative
