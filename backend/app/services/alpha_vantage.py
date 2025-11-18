import requests
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from app.core.config import settings


class AlphaVantageClient:
    """Client for Alpha Vantage API"""

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.session = requests.Session()

    def get_quote(self, ticker: str) -> Optional[Dict]:
        """Get real-time quote for a ticker"""
        try:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": ticker,
                "apikey": self.api_key
            }

            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if "Global Quote" not in data or not data["Global Quote"]:
                return None

            quote = data["Global Quote"]

            return {
                "ticker": ticker,
                "price": float(quote.get("05. price", 0)),
                "change": float(quote.get("09. change", 0)),
                "change_percent": float(quote.get("10. change percent", "0").strip("%")),
                "volume": int(quote.get("06. volume", 0)) if quote.get("06. volume") else 0,
                "high": float(quote.get("03. high", 0)) if quote.get("03. high") else None,
                "low": float(quote.get("04. low", 0)) if quote.get("04. low") else None,
                "open": float(quote.get("02. open", 0)) if quote.get("02. open") else None,
                "previous_close": float(quote.get("08. previous close", 0)),
                "updated_at": datetime.utcnow()
            }
        except Exception as e:
            print(f"Error fetching quote for {ticker}: {e}")
            return None

    def get_historical_prices(self, ticker: str, interval: str = "daily") -> List[Dict]:
        """Get historical price data"""
        try:
            function_map = {
                "daily": "TIME_SERIES_DAILY",
                "weekly": "TIME_SERIES_WEEKLY",
                "monthly": "TIME_SERIES_MONTHLY"
            }

            params = {
                "function": function_map.get(interval, "TIME_SERIES_DAILY"),
                "symbol": ticker,
                "outputsize": "full",
                "apikey": self.api_key
            }

            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Parse time series data
            time_series_key = f"Time Series ({interval.capitalize()})" if interval == "daily" else f"{interval.capitalize()} Time Series"

            if time_series_key not in data:
                return []

            prices = []
            for date_str, values in data[time_series_key].items():
                prices.append({
                    "date": datetime.strptime(date_str, "%Y-%m-%d"),
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["4. close"]),
                    "volume": int(values["5. volume"])
                })

            return sorted(prices, key=lambda x: x["date"])
        except Exception as e:
            print(f"Error fetching historical prices for {ticker}: {e}")
            return []

    def get_intraday_prices(self, ticker: str, interval: str = "60min") -> List[Dict]:
        """Get intraday price data"""
        try:
            params = {
                "function": "TIME_SERIES_INTRADAY",
                "symbol": ticker,
                "interval": interval,
                "apikey": self.api_key,
                "outputsize": "compact"
            }

            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            time_series_key = f"Time Series ({interval})"

            if time_series_key not in data:
                return []

            prices = []
            for datetime_str, values in data[time_series_key].items():
                prices.append({
                    "datetime": datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S"),
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["4. close"]),
                    "volume": int(values["5. volume"])
                })

            return sorted(prices, key=lambda x: x["datetime"])
        except Exception as e:
            print(f"Error fetching intraday prices for {ticker}: {e}")
            return []

    def search_symbols(self, keywords: str) -> List[Dict]:
        """Search for stock symbols"""
        try:
            params = {
                "function": "SYMBOL_SEARCH",
                "keywords": keywords,
                "apikey": self.api_key
            }

            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if "bestMatches" not in data:
                return []

            return [
                {
                    "ticker": match["1. symbol"],
                    "name": match["2. name"],
                    "type": match["3. type"],
                    "region": match["4. region"]
                }
                for match in data["bestMatches"][:10]
            ]
        except Exception as e:
            print(f"Error searching symbols: {e}")
            return []

    def get_company_overview(self, ticker: str) -> Optional[Dict]:
        """Get company overview and fundamentals"""
        try:
            params = {
                "function": "OVERVIEW",
                "symbol": ticker,
                "apikey": self.api_key
            }

            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if not data or "Symbol" not in data:
                return None

            return {
                "ticker": data.get("Symbol"),
                "name": data.get("Name"),
                "description": data.get("Description"),
                "sector": data.get("Sector"),
                "industry": data.get("Industry"),
                "market_cap": int(data.get("MarketCapitalization", 0)),
                "pe_ratio": float(data.get("PERatio", 0)) if data.get("PERatio") != "None" else None,
                "peg_ratio": float(data.get("PEGRatio", 0)) if data.get("PEGRatio") != "None" else None,
                "eps": float(data.get("EPS", 0)) if data.get("EPS") != "None" else None,
                "revenue": int(data.get("RevenueTTM", 0)) if data.get("RevenueTTM") != "None" else None,
                "profit_margin": float(data.get("ProfitMargin", 0)) if data.get("ProfitMargin") != "None" else None,
                "52_week_high": float(data.get("52WeekHigh", 0)),
                "52_week_low": float(data.get("52WeekLow", 0)),
                "dividend_yield": float(data.get("DividendYield", 0)) if data.get("DividendYield") != "None" else None
            }
        except Exception as e:
            print(f"Error fetching company overview for {ticker}: {e}")
            return None
