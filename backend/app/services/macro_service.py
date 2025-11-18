from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
from app.services.fred_client import fred_client


class MacroService:
    """Service for macroeconomic indicators"""

    # FRED series IDs for economic indicators
    SERIES_IDS = {
        'fed_funds': 'FEDFUNDS',      # Federal Funds Effective Rate
        'cpi': 'CPIAUCSL',            # Consumer Price Index
        'unemployment': 'UNRATE',      # Unemployment Rate
        'gdp': 'GDP',                 # Gross Domestic Product
        'gdp_growth': 'A191RL1Q225SBEA',  # Real GDP Growth
        'inflation': 'FPCPITOTLZGUSA',    # Inflation Rate
        '10y_yield': 'DGS10',         # 10-Year Treasury
        'sp500': 'SP500',             # S&P 500 Index
    }

    def __init__(self):
        self.fred = fred_client

    def get_economic_indicators(self) -> Dict:
        """Get current economic indicators"""
        try:
            # Fetch all indicators
            fed_funds = self.fred.get_series_latest(self.SERIES_IDS['fed_funds'])
            cpi = self.fred.get_series_latest(self.SERIES_IDS['cpi'])
            unemployment = self.fred.get_series_latest(self.SERIES_IDS['unemployment'])
            gdp_growth = self.fred.get_series_latest(self.SERIES_IDS['gdp_growth'])
            ten_year = self.fred.get_series_latest(self.SERIES_IDS['10y_yield'])

            # Calculate inflation YoY if we have CPI
            inflation_rate = None
            if cpi:
                cpi_history = self.fred.get_series_historical(
                    self.SERIES_IDS['cpi'],
                    limit=13
                )
                if len(cpi_history) >= 13:
                    current_cpi = cpi_history[0]['value']
                    year_ago_cpi = cpi_history[12]['value']
                    inflation_rate = ((current_cpi - year_ago_cpi) / year_ago_cpi) * 100

            return {
                'fed_funds_rate': {
                    'value': fed_funds['value'] if fed_funds else None,
                    'date': fed_funds['date'] if fed_funds else None,
                    'unit': '%',
                    'name': 'Federal Funds Rate'
                },
                'unemployment_rate': {
                    'value': unemployment['value'] if unemployment else None,
                    'date': unemployment['date'] if unemployment else None,
                    'unit': '%',
                    'name': 'Unemployment Rate'
                },
                'inflation_rate': {
                    'value': round(inflation_rate, 2) if inflation_rate else None,
                    'date': cpi['date'] if cpi else None,
                    'unit': '%',
                    'name': 'Inflation Rate (YoY)'
                },
                'gdp_growth': {
                    'value': gdp_growth['value'] if gdp_growth else None,
                    'date': gdp_growth['date'] if gdp_growth else None,
                    'unit': '%',
                    'name': 'GDP Growth Rate'
                },
                'ten_year_yield': {
                    'value': ten_year['value'] if ten_year else None,
                    'date': ten_year['date'] if ten_year else None,
                    'unit': '%',
                    'name': '10-Year Treasury Yield'
                }
            }

        except Exception as e:
            print(f"Error fetching economic indicators: {e}")
            return self._get_mock_indicators()

    def get_yield_curve(self) -> Dict:
        """Get treasury yield curve"""
        try:
            yields = self.fred.get_treasury_yields()

            # Format for frontend
            curve_data = []
            maturity_order = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']

            for maturity in maturity_order:
                if maturity in yields and yields[maturity] is not None:
                    curve_data.append({
                        'maturity': maturity,
                        'yield': round(yields[maturity], 3),
                        'months': self._maturity_to_months(maturity)
                    })

            if not curve_data:
                return self._get_mock_yield_curve()

            return {
                'data': curve_data,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'inverted': self._check_inversion(curve_data)
            }

        except Exception as e:
            print(f"Error fetching yield curve: {e}")
            return self._get_mock_yield_curve()

    def get_indicator_history(self, indicator: str, periods: int = 12) -> List[Dict]:
        """Get historical data for an economic indicator"""
        try:
            series_id = self.SERIES_IDS.get(indicator)
            if not series_id:
                return []

            history = self.fred.get_series_historical(series_id, limit=periods)
            return [
                {
                    'date': item['date'],
                    'value': round(item['value'], 2)
                }
                for item in reversed(history)
            ]

        except Exception as e:
            print(f"Error fetching indicator history: {e}")
            return []

    def _maturity_to_months(self, maturity: str) -> int:
        """Convert maturity string to months"""
        mapping = {
            '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24,
            '3Y': 36, '5Y': 60, '7Y': 84, '10Y': 120, '20Y': 240, '30Y': 360
        }
        return mapping.get(maturity, 0)

    def _check_inversion(self, curve_data: List[Dict]) -> bool:
        """Check if yield curve is inverted (2Y > 10Y)"""
        two_year = next((item['yield'] for item in curve_data if item['maturity'] == '2Y'), None)
        ten_year = next((item['yield'] for item in curve_data if item['maturity'] == '10Y'), None)

        if two_year and ten_year:
            return two_year > ten_year
        return False

    def _get_mock_indicators(self) -> Dict:
        """Fallback mock data for development"""
        return {
            'fed_funds_rate': {
                'value': 5.33,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'Federal Funds Rate'
            },
            'unemployment_rate': {
                'value': 3.8,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'Unemployment Rate'
            },
            'inflation_rate': {
                'value': 3.2,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'Inflation Rate (YoY)'
            },
            'gdp_growth': {
                'value': 2.4,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': 'GDP Growth Rate'
            },
            'ten_year_yield': {
                'value': 4.25,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'unit': '%',
                'name': '10-Year Treasury Yield'
            }
        }

    def _get_mock_yield_curve(self) -> Dict:
        """Fallback mock yield curve"""
        mock_yields = [
            {'maturity': '1M', 'yield': 5.45, 'months': 1},
            {'maturity': '3M', 'yield': 5.40, 'months': 3},
            {'maturity': '6M', 'yield': 5.35, 'months': 6},
            {'maturity': '1Y', 'yield': 5.20, 'months': 12},
            {'maturity': '2Y', 'yield': 4.95, 'months': 24},
            {'maturity': '3Y', 'yield': 4.75, 'months': 36},
            {'maturity': '5Y', 'yield': 4.50, 'months': 60},
            {'maturity': '7Y', 'yield': 4.40, 'months': 84},
            {'maturity': '10Y', 'yield': 4.25, 'months': 120},
            {'maturity': '20Y', 'yield': 4.50, 'months': 240},
            {'maturity': '30Y', 'yield': 4.35, 'months': 360},
        ]

        return {
            'data': mock_yields,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'inverted': False
        }


# Singleton instance
macro_service = MacroService()
