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
