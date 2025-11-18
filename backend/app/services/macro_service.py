import requests
from typing import Dict, List
from datetime import datetime, timedelta
from app.core.config import settings


class MacroService:
    def __init__(self):
        self.fred_api_key = settings.FRED_API_KEY
        self.fred_base_url = "https://api.stlouisfed.org/fred"

    def _fetch_fred_series(self, series_id: str, limit: int = 100) -> List[Dict]:
        """Fetch data from FRED API"""
        try:
            url = f"{self.fred_base_url}/series/observations"
            params = {
                'series_id': series_id,
                'api_key': self.fred_api_key,
                'file_type': 'json',
                'sort_order': 'desc',
                'limit': limit
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            observations = data.get('observations', [])

            # Filter out invalid values and reverse to chronological order
            valid_obs = [
                {
                    'date': obs['date'],
                    'value': float(obs['value']) if obs['value'] != '.' else None
                }
                for obs in observations if obs['value'] != '.'
            ]

            return list(reversed(valid_obs))
        except Exception as e:
            print(f"Error fetching FRED series {series_id}: {e}")
            return []

    def get_fed_funds_rate(self) -> Dict:
        """Get Federal Funds Effective Rate"""
        data = self._fetch_fred_series('FEDFUNDS', limit=60)

        if not data:
            return {
                'current': 0,
                'previous': 0,
                'change': 0,
                'history': []
            }

        current = data[-1]['value'] if data else 0
        previous = data[-2]['value'] if len(data) > 1 else current
        change = current - previous if current and previous else 0

        return {
            'current': round(current, 2) if current else 0,
            'previous': round(previous, 2) if previous else 0,
            'change': round(change, 2),
            'history': [
                {'date': d['date'], 'value': round(d['value'], 2)}
                for d in data[-12:] if d['value']
            ]
        }

    def get_inflation_data(self) -> Dict:
        """Get CPI and PCE inflation data"""
        cpi = self._fetch_fred_series('CPIAUCSL', limit=24)  # CPI for All Urban Consumers
        pce = self._fetch_fred_series('PCEPI', limit=24)     # Personal Consumption Expenditures Price Index

        def calc_yoy_change(data_points):
            if len(data_points) < 13:
                return 0
            current = data_points[-1]['value']
            year_ago = data_points[-13]['value']
            if current and year_ago:
                return ((current - year_ago) / year_ago) * 100
            return 0

        return {
            'cpi': {
                'current': round(calc_yoy_change(cpi), 2) if cpi else 0,
                'history': [
                    {'date': d['date'], 'value': round(d['value'], 2)}
                    for d in cpi[-12:] if d['value']
                ]
            },
            'pce': {
                'current': round(calc_yoy_change(pce), 2) if pce else 0,
                'history': [
                    {'date': d['date'], 'value': round(d['value'], 2)}
                    for d in pce[-12:] if d['value']
                ]
            }
        }

    def get_unemployment_rate(self) -> Dict:
        """Get Unemployment Rate"""
        data = self._fetch_fred_series('UNRATE', limit=24)

        if not data:
            return {
                'current': 0,
                'previous': 0,
                'change': 0,
                'history': []
            }

        current = data[-1]['value'] if data else 0
        previous = data[-2]['value'] if len(data) > 1 else current
        change = current - previous if current and previous else 0

        return {
            'current': round(current, 2) if current else 0,
            'previous': round(previous, 2) if previous else 0,
            'change': round(change, 2),
            'history': [
                {'date': d['date'], 'value': round(d['value'], 2)}
                for d in data[-12:] if d['value']
            ]
        }

    def get_gdp_growth(self) -> Dict:
        """Get GDP Growth Rate"""
        data = self._fetch_fred_series('A191RL1Q225SBEA', limit=20)  # Real GDP Percent Change

        if not data:
            return {
                'current': 0,
                'previous': 0,
                'change': 0,
                'history': []
            }

        current = data[-1]['value'] if data else 0
        previous = data[-2]['value'] if len(data) > 1 else current
        change = current - previous if current and previous else 0

        return {
            'current': round(current, 2) if current else 0,
            'previous': round(previous, 2) if previous else 0,
            'change': round(change, 2),
            'history': [
                {'date': d['date'], 'value': round(d['value'], 2)}
                for d in data[-8:] if d['value']
            ]
        }

    def get_treasury_yields(self) -> Dict:
        """Get Treasury Yield Curve"""
        yields = {
            '3M': 'DGS3MO',
            '2Y': 'DGS2',
            '5Y': 'DGS5',
            '10Y': 'DGS10',
            '30Y': 'DGS30'
        }

        current_yields = {}
        for label, series_id in yields.items():
            data = self._fetch_fred_series(series_id, limit=10)
            if data:
                current_yields[label] = round(data[-1]['value'], 2) if data[-1]['value'] else 0
            else:
                current_yields[label] = 0

        return {
            'current': current_yields,
            'curve': [
                {'maturity': k, 'yield': v}
                for k, v in current_yields.items()
            ]
        }

    def get_all_indicators(self) -> Dict:
        """Get all macro indicators"""
        return {
            'fed_funds_rate': self.get_fed_funds_rate(),
            'inflation': self.get_inflation_data(),
            'unemployment': self.get_unemployment_rate(),
            'gdp': self.get_gdp_growth(),
            'treasury_yields': self.get_treasury_yields()
        }


# Singleton instance
macro_service = MacroService()
