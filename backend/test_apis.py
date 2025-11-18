import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_alpha_vantage():
    """Test Alpha Vantage API"""
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey={api_key}"

    print("Testing Alpha Vantage API...")
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if 'Global Quote' in data and data['Global Quote']:
            print("✅ Alpha Vantage API working!")
            print(f"   AAPL Price: ${data['Global Quote']['05. price']}")
            return True
        elif 'Note' in data:
            print("⚠️  Alpha Vantage: API call frequency exceeded")
            return False
        else:
            print("❌ Alpha Vantage: Invalid response")
            print(f"   Response: {data}")
            return False
    except Exception as e:
        print(f"❌ Alpha Vantage error: {e}")
        return False

def test_news_api():
    """Test NewsAPI"""
    api_key = os.getenv('NEWS_API_KEY')
    url = f"https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey={api_key}"

    print("\nTesting NewsAPI...")
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if data.get('status') == 'ok' and data.get('articles'):
            print("✅ NewsAPI working!")
            print(f"   Found {len(data['articles'])} articles")
            return True
        else:
            print("❌ NewsAPI: Invalid response")
            print(f"   Response: {data}")
            return False
    except Exception as e:
        print(f"❌ NewsAPI error: {e}")
        return False

def test_fred_api():
    """Test FRED API"""
    api_key = os.getenv('FRED_API_KEY')
    url = f"https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key={api_key}&file_type=json&limit=1&sort_order=desc"

    print("\nTesting FRED API...")
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if 'observations' in data and data['observations']:
            print("✅ FRED API working!")
            latest = data['observations'][0]
            print(f"   Fed Funds Rate: {latest['value']}% (as of {latest['date']})")
            return True
        else:
            print("❌ FRED API: Invalid response")
            print(f"   Response: {data}")
            return False
    except Exception as e:
        print(f"❌ FRED API error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("API Configuration Test")
    print("=" * 60)

    results = {
        'alpha_vantage': test_alpha_vantage(),
        'news_api': test_news_api(),
        'fred': test_fred_api()
    }

    print("\n" + "=" * 60)
    print("Summary:")
    print("=" * 60)
    for api, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {api.replace('_', ' ').title()}: {'Working' if status else 'Failed'}")

    if all(results.values()):
        print("\n🎉 All APIs configured correctly!")
    else:
        print("\n⚠️  Some APIs failed. Please check your keys.")
