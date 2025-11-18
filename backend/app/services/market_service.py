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

    def get_intraday_data(self, ticker: str, interval: str = "5min") -> List[Dict]:
        """Get intraday price data for detailed charts"""
        try:
            # Check cache first
            cache_key = f"intraday_{ticker}_{interval}_{int(datetime.now().timestamp() // 60)}"
            if cache_key in self.chart_cache:
                return self.chart_cache[cache_key]

            # Fetch from Alpha Vantage
            params = {
                'function': 'TIME_SERIES_INTRADAY',
                'symbol': ticker,
                'interval': interval,
                'apikey': self.av_key,
                'outputsize': 'compact'  # Last 100 data points
            }

            response = requests.get(self.av_base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Find the time series key
            time_series_key = f"Time Series ({interval})"

            if time_series_key in data and data[time_series_key]:
                time_series = data[time_series_key]

                result = []
                for timestamp, values in sorted(time_series.items()):
                    result.append({
                        'timestamp': timestamp,
                        'open': round(float(values['1. open']), 2),
                        'high': round(float(values['2. high']), 2),
                        'low': round(float(values['3. low']), 2),
                        'close': round(float(values['4. close']), 2),
                        'volume': int(values['5. volume'])
                    })

                # Cache the result
                self.chart_cache[cache_key] = result
                return result
            else:
                # Return mock intraday data if API limit reached
                print(f"API limit reached for intraday data {ticker}, using mock data")
                return self._get_mock_intraday_data(ticker, interval)

        except Exception as e:
            print(f"Error fetching intraday data for {ticker}: {e}")
            return self._get_mock_intraday_data(ticker, interval)

    def _get_mock_intraday_data(self, ticker: str, interval: str) -> List[Dict]:
        """Generate mock intraday data for development/testing"""
        # Determine number of data points based on interval
        interval_points = {
            '1min': 60, '5min': 78, '15min': 26,
            '30min': 13, '60min': 7
        }
        num_points = interval_points.get(interval, 78)

        # Get base price
        quote = self._get_mock_quote(ticker)
        base_price = quote.price

        result = []
        current_time = datetime.now()

        # Parse interval to minutes
        interval_minutes = int(interval.replace('min', ''))

        for i in range(num_points):
            time_offset = timedelta(minutes=interval_minutes * (num_points - i))
            timestamp = current_time - time_offset

            # Generate realistic intraday movement
            open_price = base_price * (1 + random.uniform(-0.02, 0.02))
            close_price = open_price * (1 + random.uniform(-0.01, 0.01))
            high_price = max(open_price, close_price) * (1 + random.uniform(0, 0.005))
            low_price = min(open_price, close_price) * (1 - random.uniform(0, 0.005))

            result.append({
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': random.randint(100000, 1000000)
            })

        return result

    def get_company_overview(self, ticker: str) -> Dict:
        """Get detailed company information and fundamentals"""
        try:
            # Check cache first (24 hour cache for company info)
            cache_key = f"company_{ticker}_{int(datetime.now().timestamp() // 86400)}"
            if cache_key in self.quote_cache:
                return self.quote_cache[cache_key]

            # Fetch from Alpha Vantage
            params = {
                'function': 'OVERVIEW',
                'symbol': ticker,
                'apikey': self.av_key
            }

            response = requests.get(self.av_base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data and 'Symbol' in data:
                overview = {
                    'symbol': data.get('Symbol'),
                    'name': data.get('Name'),
                    'description': data.get('Description'),
                    'sector': data.get('Sector'),
                    'industry': data.get('Industry'),
                    'exchange': data.get('Exchange'),
                    'country': data.get('Country'),
                    'market_cap': int(data.get('MarketCapitalization', 0)) if data.get('MarketCapitalization') else None,
                    'pe_ratio': float(data.get('PERatio', 0)) if data.get('PERatio') else None,
                    'peg_ratio': float(data.get('PEGRatio', 0)) if data.get('PEGRatio') else None,
                    'dividend_yield': float(data.get('DividendYield', 0)) if data.get('DividendYield') else None,
                    'eps': float(data.get('EPS', 0)) if data.get('EPS') else None,
                    'beta': float(data.get('Beta', 0)) if data.get('Beta') else None,
                    '52_week_high': float(data.get('52WeekHigh', 0)) if data.get('52WeekHigh') else None,
                    '52_week_low': float(data.get('52WeekLow', 0)) if data.get('52WeekLow') else None,
                    '50_day_ma': float(data.get('50DayMovingAverage', 0)) if data.get('50DayMovingAverage') else None,
                    '200_day_ma': float(data.get('200DayMovingAverage', 0)) if data.get('200DayMovingAverage') else None,
                }

                # Cache the result
                self.quote_cache[cache_key] = overview
                return overview
            else:
                # Return mock company overview if API limit reached
                print(f"API limit reached for company overview {ticker}, using mock data")
                return self._get_mock_company_overview(ticker)

        except Exception as e:
            print(f"Error fetching company overview for {ticker}: {e}")
            return self._get_mock_company_overview(ticker)

    def _get_mock_company_overview(self, ticker: str) -> Dict:
        """Generate mock company overview for development/testing"""
        mock_companies = {
            'AAPL': {
                'name': 'Apple Inc.',
                'sector': 'Technology',
                'industry': 'Consumer Electronics',
                'description': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
            },
            'MSFT': {
                'name': 'Microsoft Corporation',
                'sector': 'Technology',
                'industry': 'Software',
                'description': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
            },
            'GOOGL': {
                'name': 'Alphabet Inc.',
                'sector': 'Technology',
                'industry': 'Internet Content & Information',
                'description': 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.'
            }
        }

        company_info = mock_companies.get(ticker, {
            'name': f'{ticker} Corporation',
            'sector': 'Technology',
            'industry': 'Software',
            'description': f'{ticker} is a leading technology company.'
        })

        quote = self._get_mock_quote(ticker)

        return {
            'symbol': ticker,
            'name': company_info['name'],
            'description': company_info['description'],
            'sector': company_info['sector'],
            'industry': company_info['industry'],
            'exchange': 'NASDAQ',
            'country': 'United States',
            'market_cap': random.randint(100000000000, 3000000000000),
            'pe_ratio': round(random.uniform(15, 45), 2),
            'peg_ratio': round(random.uniform(1, 3), 2),
            'dividend_yield': round(random.uniform(0, 3), 2),
            'eps': round(random.uniform(1, 10), 2),
            'beta': round(random.uniform(0.8, 1.5), 2),
            '52_week_high': round(quote.price * 1.2, 2),
            '52_week_low': round(quote.price * 0.8, 2),
            '50_day_ma': round(quote.price * 0.98, 2),
            '200_day_ma': round(quote.price * 0.95, 2),
        }

    def calculate_technical_indicators(self, ticker: str, indicators: List[str] = None) -> Dict:
        """Calculate technical indicators on historical data"""
        if indicators is None:
            indicators = ['SMA', 'RSI', 'MACD']

        try:
            # Get historical data (6 months for enough data points)
            chart_data = self.get_chart_data(ticker, period='6M')

            if not chart_data.close or len(chart_data.close) < 50:
                return {}

            closes = chart_data.close
            results = {}

            # Simple Moving Averages
            if 'SMA' in indicators:
                results['sma_20'] = self._calculate_sma(closes, 20)
                results['sma_50'] = self._calculate_sma(closes, 50)
                if len(closes) >= 200:
                    results['sma_200'] = self._calculate_sma(closes, 200)

            # Relative Strength Index
            if 'RSI' in indicators:
                results['rsi'] = self._calculate_rsi(closes, 14)

            # MACD
            if 'MACD' in indicators:
                macd_data = self._calculate_macd(closes)
                results['macd'] = macd_data['macd']
                results['macd_signal'] = macd_data['signal']
                results['macd_histogram'] = macd_data['histogram']

            return results

        except Exception as e:
            print(f"Error calculating technical indicators for {ticker}: {e}")
            return {}

    def _calculate_sma(self, prices: List[float], period: int) -> List[float]:
        """Calculate Simple Moving Average"""
        sma = []
        for i in range(len(prices)):
            if i < period - 1:
                sma.append(None)
            else:
                window = prices[i - period + 1:i + 1]
                sma.append(round(sum(window) / period, 2))
        return sma

    def _calculate_rsi(self, prices: List[float], period: int = 14) -> List[float]:
        """Calculate Relative Strength Index"""
        if len(prices) < period + 1:
            return []

        deltas = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
        gains = [d if d > 0 else 0 for d in deltas]
        losses = [-d if d < 0 else 0 for d in deltas]

        rsi = []
        for i in range(len(gains)):
            if i < period - 1:
                rsi.append(None)
            else:
                avg_gain = sum(gains[i - period + 1:i + 1]) / period
                avg_loss = sum(losses[i - period + 1:i + 1]) / period

                if avg_loss == 0:
                    rsi.append(100)
                else:
                    rs = avg_gain / avg_loss
                    rsi.append(round(100 - (100 / (1 + rs)), 2))

        return rsi

    def _calculate_macd(self, prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Dict:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        # Calculate EMAs
        ema_fast = self._calculate_ema(prices, fast)
        ema_slow = self._calculate_ema(prices, slow)

        # Calculate MACD line
        macd_line = []
        for i in range(len(prices)):
            if ema_fast[i] is not None and ema_slow[i] is not None:
                macd_line.append(round(ema_fast[i] - ema_slow[i], 2))
            else:
                macd_line.append(None)

        # Calculate signal line (EMA of MACD)
        macd_values = [m for m in macd_line if m is not None]
        signal_line_values = self._calculate_ema(macd_values, signal)

        # Pad signal line to match length
        signal_line = [None] * (len(macd_line) - len(signal_line_values)) + signal_line_values

        # Calculate histogram
        histogram = []
        for i in range(len(macd_line)):
            if macd_line[i] is not None and signal_line[i] is not None:
                histogram.append(round(macd_line[i] - signal_line[i], 2))
            else:
                histogram.append(None)

        return {
            'macd': macd_line,
            'signal': signal_line,
            'histogram': histogram
        }

    def _calculate_ema(self, prices: List[float], period: int) -> List[float]:
        """Calculate Exponential Moving Average"""
        ema = []
        multiplier = 2 / (period + 1)

        for i in range(len(prices)):
            if i < period - 1:
                ema.append(None)
            elif i == period - 1:
                # First EMA is SMA
                sma = sum(prices[:period]) / period
                ema.append(sma)
            else:
                # EMA = (Close - EMA(previous)) * multiplier + EMA(previous)
                prev_ema = ema[-1]
                current_ema = (prices[i] - prev_ema) * multiplier + prev_ema
                ema.append(round(current_ema, 2))

        return ema


# Singleton instance
market_service = MarketService()
