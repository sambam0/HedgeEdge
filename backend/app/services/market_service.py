import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
from app.core.config import settings
from app.models.schemas import Quote, IndexData, ChartData


class MarketService:
    def __init__(self):
        self.av_key = settings.ALPHA_VANTAGE_API_KEY
        self.av_base_url = "https://www.alphavantage.co/query"
        # In-memory cache to reduce API calls
        self.quote_cache = {}
        self.chart_cache = {}
        self.cache_ttl = 60  # seconds

    def get_quote(self, ticker: str) -> Quote:
        """Get real-time quote for a ticker using Alpha Vantage"""
        try:
            # Check cache first
            cache_key = f"{ticker}_{int(datetime.now().timestamp() // self.cache_ttl)}"
            if cache_key in self.quote_cache:
                return self.quote_cache[cache_key]

            # Fetch from Alpha Vantage
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': ticker,
                'apikey': self.av_key
            }

            response = requests.get(self.av_base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'Global Quote' in data and data['Global Quote']:
                quote_data = data['Global Quote']
                current_price = float(quote_data.get('05. price', 0))
                previous_close = float(quote_data.get('08. previous close', current_price))
                change = float(quote_data.get('09. change', 0))
                change_percent = float(quote_data.get('10. change percent', '0').replace('%', ''))

                quote = Quote(
                    ticker=ticker,
                    price=round(current_price, 2),
                    change=round(change, 2),
                    change_percent=round(change_percent, 2),
                    volume=int(quote_data.get('06. volume', 0)) if quote_data.get('06. volume') else None,
                    high=float(quote_data.get('03. high', 0)) if quote_data.get('03. high') else None,
                    low=float(quote_data.get('04. low', 0)) if quote_data.get('04. low') else None,
                    open=float(quote_data.get('02. open', 0)) if quote_data.get('02. open') else None,
                    previous_close=previous_close
                )

                # Cache the result
                self.quote_cache[cache_key] = quote
                return quote
            else:
                # Fallback to mock data if API limit reached
                print(f"API limit reached or data unavailable for {ticker}, using mock data")
                return self._get_mock_quote(ticker)

        except Exception as e:
            print(f"Error fetching quote for {ticker}: {e}")
            return self._get_mock_quote(ticker)

    def _get_mock_quote(self, ticker: str) -> Quote:
        """Return mock data when API is unavailable (for development/testing)"""
        # Mock prices for common tickers
        mock_prices = {
            'AAPL': 175.43, 'MSFT': 380.50, 'GOOGL': 140.25, 'AMZN': 155.80,
            'TSLA': 242.15, 'META': 485.90, 'NVDA': 495.20, 'AMD': 165.75,
            '^GSPC': 4550.50, '^IXIC': 14200.30, '^DJI': 35800.20, '^RUT': 2050.75,
            'JPM': 145.30, 'BAC': 28.75, 'WMT': 165.20, 'V': 245.80,
            'MA': 385.50, 'DIS': 95.40, 'NFLX': 425.60, 'PYPL': 62.30
        }

        base_price = mock_prices.get(ticker, 100.0)
        # Add some random variation
        change_percent = random.uniform(-3, 3)
        change = base_price * (change_percent / 100)

        return Quote(
            ticker=ticker,
            price=round(base_price, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
            volume=random.randint(5000000, 50000000),
            market_cap=random.randint(10000000000, 2000000000000),
            pe_ratio=round(random.uniform(10, 50), 2),
            high=round(base_price * 1.02, 2),
            low=round(base_price * 0.98, 2),
            open=round(base_price * 0.99, 2),
            previous_close=round(base_price - change, 2)
        )

    def get_multiple_quotes(self, tickers: List[str]) -> List[Quote]:
        """Get quotes for multiple tickers"""
        quotes = []
        for ticker in tickers:
            quote = self.get_quote(ticker)
            quotes.append(quote)
        return quotes

    def get_indices(self) -> List[IndexData]:
        """Get major market indices"""
        indices = {
            '^GSPC': 'S&P 500',
            '^IXIC': 'NASDAQ',
            '^DJI': 'Dow Jones',
            '^RUT': 'Russell 2000'
        }

        results = []
        for symbol, name in indices.items():
            quote = self.get_quote(symbol)
            results.append(IndexData(
                symbol=symbol,
                name=name,
                price=quote.price,
                change=quote.change,
                change_percent=quote.change_percent
            ))

        return results

    def get_chart_data(self, ticker: str, period: str = '1M') -> ChartData:
        """Get historical chart data for a ticker"""
        try:
            cache_key = f"chart_{ticker}_{period}"
            if cache_key in self.chart_cache:
                return self.chart_cache[cache_key]

            # Map periods to Alpha Vantage functions
            if period in ['1D', '5D']:
                function = 'TIME_SERIES_INTRADAY'
                interval = '60min'
            else:
                function = 'TIME_SERIES_DAILY'
                interval = None

            params = {
                'function': function,
                'symbol': ticker,
                'apikey': self.av_key,
                'outputsize': 'compact'
            }

            if interval:
                params['interval'] = interval

            response = requests.get(self.av_base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Parse the response
            time_series_key = None
            for key in data.keys():
                if 'Time Series' in key:
                    time_series_key = key
                    break

            if time_series_key and data.get(time_series_key):
                time_series = data[time_series_key]

                timestamps = []
                opens = []
                highs = []
                lows = []
                closes = []
                volumes = []

                # Sort by date
                sorted_dates = sorted(time_series.keys())

                # Limit data points based on period
                limit_map = {
                    '1D': 10, '5D': 40, '1M': 30, '3M': 90,
                    '6M': 180, '1Y': 252, 'YTD': 252, '5Y': 1260, 'MAX': 5000
                }
                limit = limit_map.get(period, 30)
                sorted_dates = sorted_dates[-limit:]

                for date_str in sorted_dates:
                    day_data = time_series[date_str]
                    timestamps.append(date_str)
                    opens.append(round(float(day_data['1. open']), 2))
                    highs.append(round(float(day_data['2. high']), 2))
                    lows.append(round(float(day_data['3. low']), 2))
                    closes.append(round(float(day_data['4. close']), 2))
                    volumes.append(int(day_data['5. volume']))

                chart_data = ChartData(
                    timestamp=timestamps,
                    open=opens,
                    high=highs,
                    low=lows,
                    close=closes,
                    volume=volumes
                )

                # Cache the result
                self.chart_cache[cache_key] = chart_data
                return chart_data
            else:
                # Return mock chart data if API limit reached
                return self._get_mock_chart_data(ticker, period)

        except Exception as e:
            print(f"Error fetching chart data for {ticker}: {e}")
            return self._get_mock_chart_data(ticker, period)

    def _get_mock_chart_data(self, ticker: str, period: str) -> ChartData:
        """Generate mock chart data for development/testing"""
        # Determine number of data points
        point_count_map = {
            '1D': 10, '5D': 40, '1M': 30, '3M': 90,
            '6M': 180, '1Y': 252, 'YTD': 200, '5Y': 1260, 'MAX': 1260
        }
        num_points = point_count_map.get(period, 30)

        # Get base price from mock quote
        quote = self._get_mock_quote(ticker)
        base_price = quote.price

        timestamps = []
        opens = []
        highs = []
        lows = []
        closes = []
        volumes = []

        current_date = datetime.now()

        for i in range(num_points):
            date = current_date - timedelta(days=num_points - i)
            timestamps.append(date.strftime('%Y-%m-%d'))

            # Generate realistic OHLC data
            open_price = base_price * (1 + random.uniform(-0.15, 0.15))
            close_price = open_price * (1 + random.uniform(-0.03, 0.03))
            high_price = max(open_price, close_price) * (1 + random.uniform(0, 0.02))
            low_price = min(open_price, close_price) * (1 - random.uniform(0, 0.02))

            opens.append(round(open_price, 2))
            highs.append(round(high_price, 2))
            lows.append(round(low_price, 2))
            closes.append(round(close_price, 2))
            volumes.append(random.randint(10000000, 100000000))

        return ChartData(
            timestamp=timestamps,
            open=opens,
            high=highs,
            low=lows,
            close=closes,
            volume=volumes
        )

    def search_stocks(self, query: str) -> List[Dict]:
        """Search for stocks by symbol or name"""
        try:
            params = {
                'function': 'SYMBOL_SEARCH',
                'keywords': query,
                'apikey': self.av_key
            }

            response = requests.get(self.av_base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if 'bestMatches' in data:
                results = []
                for match in data['bestMatches'][:5]:
                    results.append({
                        'symbol': match['1. symbol'],
                        'name': match['2. name'],
                        'type': match['3. type']
                    })
                return results
            return []
        except Exception as e:
            print(f"Error searching stocks: {e}")
            return []

    def get_movers(self) -> Dict[str, List[Dict]]:
        """Get top gainers and losers"""
        # For MVP, return popular stocks with quotes
        popular_tickers = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD',
            'JPM', 'BAC', 'WMT', 'V', 'MA', 'DIS', 'NFLX', 'PYPL'
        ]

        quotes = []
        for ticker in popular_tickers:
            quote = self.get_quote(ticker)
            if quote.price > 0:
                quotes.append({
                    'ticker': quote.ticker,
                    'price': quote.price,
                    'change': quote.change,
                    'change_percent': quote.change_percent
                })

        # Sort by change percent
        sorted_quotes = sorted(quotes, key=lambda x: x['change_percent'], reverse=True)

        return {
            'gainers': sorted_quotes[:5],
            'losers': sorted_quotes[-5:]
        }


# Singleton instance
market_service = MarketService()
