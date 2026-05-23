# Alpaca Markets API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Alpaca Markets API as the live data source for portfolio positions and account performance, surfaced through new `/api/v1/portfolio/alpaca/positions` and `/api/v1/portfolio/alpaca/summary` endpoints.

**Architecture:** `AlpacaClient` wraps `alpaca-py`'s `TradingClient` and handles all string→float conversions (Alpaca returns numeric fields as strings) and a simple in-memory TTL cache to avoid rate-limit issues. New Pydantic schemas in `alpaca_schemas.py` define the canonical shape for Alpaca data. Two new FastAPI routes are added to the existing portfolio router. The frontend adds an `alpacaAPI` call surface and the dashboard is updated to use it. All existing local-DB CRUD endpoints remain untouched — they serve as historical bookkeeping.

**Tech Stack:** `alpaca-py`, FastAPI, Pydantic v2, SQLAlchemy (untouched), Next.js 14, TypeScript

**Architecture decision:** Local DB tables (`Portfolio`, `Position`, `Transaction`) are kept as-is for historical records. They are not deleted or deprecated. Alpaca data flows through new endpoints only.

---

## Pre-flight

Before starting: add your Alpaca API credentials to `backend/.env`:

```
ALPACA_API_KEY=your_key_here
ALPACA_SECRET_KEY=your_secret_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

For live trading, use `https://api.alpaca.markets`. The `account_mode` field in all responses reflects this automatically.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| MODIFY | `backend/requirements.txt` | Add `alpaca-py` |
| MODIFY | `backend/app/core/config.py` | Add Alpaca env fields |
| CREATE | `backend/app/models/alpaca_schemas.py` | Pydantic schemas for Alpaca data |
| CREATE | `backend/app/services/alpaca_client.py` | TradingClient wrapper + TTL cache + type conversions |
| MODIFY | `backend/app/api/v1/portfolio.py` | Add `/alpaca/positions` and `/alpaca/summary` routes |
| CREATE | `backend/test_alpaca.py` | Unit tests (mock TradingClient) |
| MODIFY | `frontend/lib/api/portfolio.ts` | Add `AlpacaPosition`, `AlpacaSummary` types + `alpacaAPI` |
| MODIFY | `frontend/app/page.tsx` | Switch dashboard portfolio card to use `alpacaAPI.getSummary()` |

---

## Task 1: Add Dependency and Config Fields

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `backend/app/core/config.py`

- [ ] **Step 1: Add alpaca-py to requirements**

Edit `backend/requirements.txt` — append this line:

```
alpaca-py==0.38.0
```

- [ ] **Step 2: Add Alpaca fields to Settings**

Edit `backend/app/core/config.py`. The full updated file:

```python
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Keys
    ALPHA_VANTAGE_API_KEY: str
    FRED_API_KEY: str
    FMP_API_KEY: str
    NEWS_API_KEY: str

    # Alpaca
    ALPACA_API_KEY: str = ""
    ALPACA_SECRET_KEY: str = ""
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Principle Trading Terminal"
    DEBUG: bool = True

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def alpaca_account_mode(self) -> str:
        return "paper" if "paper" in self.ALPACA_BASE_URL else "live"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

- [ ] **Step 3: Install the new dependency**

```bash
cd backend && pip install alpaca-py==0.38.0
```

Expected: `Successfully installed alpaca-py-0.38.0` (and its dependencies)

- [ ] **Step 4: Verify server still boots**

```bash
cd backend && python -c "from app.core.config import settings; print(settings.alpaca_account_mode)"
```

Expected output: `paper`

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/app/core/config.py
git commit -m "feat: add alpaca-py dependency and config fields"
```

---

## Task 2: Alpaca Pydantic Schemas

**Files:**
- Create: `backend/app/models/alpaca_schemas.py`
- Create: `backend/test_alpaca.py` (first test)

The schemas define the exact shape the API will return. All numeric fields are `float` — the client (Task 3) handles conversion from Alpaca's strings.

- [ ] **Step 1: Write failing schema validation tests**

Create `backend/test_alpaca.py`:

```python
import pytest
from pydantic import ValidationError


def test_alpaca_position_rejects_string_numeric_fields():
    """Alpaca returns strings for all numeric fields — our schema must enforce float."""
    from app.models.alpaca_schemas import AlpacaPosition
    with pytest.raises(ValidationError):
        AlpacaPosition(
            ticker="AAPL",
            shares="10",          # string — must be rejected
            cost_basis="1500.00",
            current_price="155.00",
            current_value="1550.00",
            gain_loss="50.00",
            gain_loss_percent="3.33",
            daily_change="12.50",
            daily_change_percent="0.81",
        )


def test_alpaca_summary_requires_positions_list():
    from app.models.alpaca_schemas import AlpacaSummary
    with pytest.raises(ValidationError):
        AlpacaSummary(
            total_value=10000.0,
            total_cost=9500.0,
            total_gain_loss=500.0,
            total_gain_loss_percent=5.26,
            daily_change=120.0,
            daily_change_percent=1.2,
            positions_count=2,
            account_mode="paper",
            # positions missing
        )


def test_alpaca_summary_valid():
    from app.models.alpaca_schemas import AlpacaSummary, AlpacaPosition
    pos = AlpacaPosition(
        ticker="AAPL",
        shares=10.0,
        cost_basis=1500.0,
        current_price=155.0,
        current_value=1550.0,
        gain_loss=50.0,
        gain_loss_percent=3.33,
        daily_change=12.5,
        daily_change_percent=0.81,
    )
    summary = AlpacaSummary(
        total_value=1550.0,
        total_cost=1500.0,
        total_gain_loss=50.0,
        total_gain_loss_percent=3.33,
        daily_change=12.5,
        daily_change_percent=0.81,
        positions_count=1,
        account_mode="paper",
        positions=[pos],
    )
    assert summary.positions_count == 1
    assert summary.account_mode == "paper"
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd backend && python -m pytest test_alpaca.py -v
```

Expected: `ImportError: cannot import name 'AlpacaPosition' from 'app.models.alpaca_schemas'`

- [ ] **Step 3: Create the schemas**

Create `backend/app/models/alpaca_schemas.py`:

```python
from pydantic import BaseModel
from typing import Literal


class AlpacaPosition(BaseModel):
    ticker: str
    shares: float
    cost_basis: float          # total cost basis (qty * avg_entry_price)
    current_price: float
    current_value: float       # market_value from Alpaca
    gain_loss: float           # unrealized_pl
    gain_loss_percent: float   # unrealized_plpc converted to percent (x100)
    daily_change: float        # dollar change today (market_value * change_today)
    daily_change_percent: float  # change_today converted to percent (x100)


class AlpacaAccount(BaseModel):
    equity: float
    last_equity: float
    buying_power: float
    cash: float
    daytrade_count: int
    account_mode: Literal["paper", "live"]


class AlpacaSummary(BaseModel):
    total_value: float
    total_cost: float
    total_gain_loss: float
    total_gain_loss_percent: float
    daily_change: float
    daily_change_percent: float
    positions_count: int
    account_mode: Literal["paper", "live"]
    positions: list[AlpacaPosition]
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd backend && python -m pytest test_alpaca.py -v
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/alpaca_schemas.py backend/test_alpaca.py
git commit -m "feat: add Alpaca Pydantic schemas with validation tests"
```

---

## Task 3: AlpacaClient Service

**Files:**
- Create: `backend/app/services/alpaca_client.py`
- Modify: `backend/test_alpaca.py` (add service tests)

This is the most critical file. It handles:
1. String→float conversion for every Alpaca numeric field
2. In-memory TTL cache (60s for positions, 30s for account)
3. A module-level singleton (`alpaca_client`) for use by the API layer

**Critical Alpaca field mapping:**

| Alpaca field | Type | Maps to | Conversion |
|---|---|---|---|
| `symbol` | str | `ticker` | direct |
| `qty` | str | `shares` | `float(qty)` |
| `cost_basis` | str | `cost_basis` | `float(cost_basis)` — this is TOTAL cost, not per-share |
| `current_price` | str | `current_price` | `float(current_price)` |
| `market_value` | str | `current_value` | `float(market_value)` |
| `unrealized_pl` | str | `gain_loss` | `float(unrealized_pl)` |
| `unrealized_plpc` | str | `gain_loss_percent` | `float(unrealized_plpc) * 100` |
| `change_today` | str | `daily_change_percent` | `float(change_today) * 100` |
| derived | - | `daily_change` | `float(market_value) * float(change_today)` |

Account mapping:

| Alpaca field | Type | Maps to | Conversion |
|---|---|---|---|
| `equity` | str | `equity` / `total_value` | `float(equity)` |
| `last_equity` | str | `last_equity` | `float(last_equity)` |
| `buying_power` | str | `buying_power` | `float(buying_power)` |
| `cash` | str | `cash` | `float(cash)` |
| `daytrade_count` | int | `daytrade_count` | direct |

- [ ] **Step 1: Add service tests to test_alpaca.py**

Append to `backend/test_alpaca.py`:

```python
from unittest.mock import MagicMock, patch
from types import SimpleNamespace


def _make_mock_position(**overrides):
    """Returns a mock Alpaca Position object with string numeric fields."""
    defaults = dict(
        symbol="AAPL",
        qty="10",
        avg_entry_price="150.00",
        cost_basis="1500.00",
        current_price="155.00",
        market_value="1550.00",
        unrealized_pl="50.00",
        unrealized_plpc="0.03333",
        change_today="0.00806",
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def _make_mock_account(**overrides):
    defaults = dict(
        equity="1550.00",
        last_equity="1537.50",
        buying_power="8450.00",
        cash="8450.00",
        daytrade_count=0,
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def test_client_converts_position_strings_to_floats():
    from app.services.alpaca_client import AlpacaClient
    mock_trading_client = MagicMock()
    mock_trading_client.get_all_positions.return_value = [_make_mock_position()]

    client = AlpacaClient(_client=mock_trading_client)
    positions = client.get_positions()

    assert len(positions) == 1
    p = positions[0]
    assert p.ticker == "AAPL"
    assert p.shares == 10.0
    assert p.cost_basis == 1500.0
    assert p.current_price == 155.0
    assert p.current_value == 1550.0
    assert p.gain_loss == 50.0
    assert round(p.gain_loss_percent, 2) == 3.33
    assert round(p.daily_change_percent, 2) == 0.81
    assert isinstance(p.shares, float)


def test_client_builds_summary_from_account_and_positions():
    from app.services.alpaca_client import AlpacaClient
    mock_trading_client = MagicMock()
    mock_trading_client.get_all_positions.return_value = [_make_mock_position()]
    mock_trading_client.get_account.return_value = _make_mock_account()

    client = AlpacaClient(_client=mock_trading_client)
    summary = client.get_summary()

    assert summary.total_value == 1550.0
    assert summary.positions_count == 1
    assert summary.account_mode in ("paper", "live")
    assert len(summary.positions) == 1


def test_client_cache_prevents_duplicate_calls():
    from app.services.alpaca_client import AlpacaClient
    mock_trading_client = MagicMock()
    mock_trading_client.get_all_positions.return_value = [_make_mock_position()]

    client = AlpacaClient(_client=mock_trading_client)
    client.get_positions()
    client.get_positions()

    # Should only have called Alpaca once
    mock_trading_client.get_all_positions.assert_called_once()


def test_client_returns_503_friendly_error_on_alpaca_failure():
    from app.services.alpaca_client import AlpacaClient, AlpacaUnavailableError
    mock_trading_client = MagicMock()
    mock_trading_client.get_all_positions.side_effect = Exception("Connection refused")

    client = AlpacaClient(_client=mock_trading_client)
    with pytest.raises(AlpacaUnavailableError):
        client.get_positions()
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd backend && python -m pytest test_alpaca.py -v -k "test_client"
```

Expected: `ImportError: cannot import name 'AlpacaClient'`

- [ ] **Step 3: Implement AlpacaClient**

Create `backend/app/services/alpaca_client.py`:

```python
import time
from typing import Any
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import GetPortfolioHistoryRequest
from app.core.config import settings
from app.models.alpaca_schemas import AlpacaPosition, AlpacaSummary


class AlpacaUnavailableError(Exception):
    """Raised when the Alpaca API cannot be reached."""


_cache: dict[str, tuple[Any, float]] = {}
_POSITIONS_TTL = 60
_ACCOUNT_TTL = 30


def _get_cached(key: str, fn, ttl: int) -> Any:
    if key in _cache:
        value, ts = _cache[key]
        if time.time() - ts < ttl:
            return value
    value = fn()
    _cache[key] = (value, time.time())
    return value


def _to_float(value: Any) -> float:
    return float(value) if value is not None else 0.0


def _map_position(pos) -> AlpacaPosition:
    market_value = _to_float(pos.market_value)
    change_today = _to_float(pos.change_today)
    return AlpacaPosition(
        ticker=pos.symbol,
        shares=_to_float(pos.qty),
        cost_basis=_to_float(pos.cost_basis),
        current_price=_to_float(pos.current_price),
        current_value=market_value,
        gain_loss=_to_float(pos.unrealized_pl),
        gain_loss_percent=round(_to_float(pos.unrealized_plpc) * 100, 4),
        daily_change=round(market_value * change_today, 2),
        daily_change_percent=round(change_today * 100, 4),
    )


class AlpacaClient:
    def __init__(self, _client: TradingClient | None = None):
        # Accept an injected client for testing; otherwise build from settings
        if _client is not None:
            self._client = _client
        else:
            paper = "paper" in settings.ALPACA_BASE_URL
            self._client = TradingClient(
                api_key=settings.ALPACA_API_KEY,
                secret_key=settings.ALPACA_SECRET_KEY,
                paper=paper,
            )

    def get_positions(self) -> list[AlpacaPosition]:
        try:
            raw = _get_cached("positions", self._client.get_all_positions, _POSITIONS_TTL)
            return [_map_position(p) for p in raw]
        except AlpacaUnavailableError:
            raise
        except Exception as e:
            raise AlpacaUnavailableError(str(e)) from e

    def get_account(self):
        try:
            return _get_cached("account", self._client.get_account, _ACCOUNT_TTL)
        except AlpacaUnavailableError:
            raise
        except Exception as e:
            raise AlpacaUnavailableError(str(e)) from e

    def get_summary(self) -> AlpacaSummary:
        positions = self.get_positions()
        account = self.get_account()

        equity = _to_float(account.equity)
        last_equity = _to_float(account.last_equity)
        daily_change = equity - last_equity
        daily_change_pct = (daily_change / last_equity * 100) if last_equity else 0.0

        total_cost = sum(p.cost_basis for p in positions)
        total_gain_loss = sum(p.gain_loss for p in positions)
        total_gain_loss_pct = (total_gain_loss / total_cost * 100) if total_cost else 0.0

        return AlpacaSummary(
            total_value=round(equity, 2),
            total_cost=round(total_cost, 2),
            total_gain_loss=round(total_gain_loss, 2),
            total_gain_loss_percent=round(total_gain_loss_pct, 4),
            daily_change=round(daily_change, 2),
            daily_change_percent=round(daily_change_pct, 4),
            positions_count=len(positions),
            account_mode=settings.alpaca_account_mode,
            positions=positions,
        )

    def get_portfolio_history(self, period: str = "1M", timeframe: str = "1D"):
        try:
            key = f"history:{period}:{timeframe}"
            req = GetPortfolioHistoryRequest(period=period, timeframe=timeframe)
            return _get_cached(key, lambda: self._client.get_portfolio_history(req), _POSITIONS_TTL)
        except Exception as e:
            raise AlpacaUnavailableError(str(e)) from e

    def clear_cache(self):
        _cache.clear()


# Module-level singleton — used by the API layer
alpaca_client = AlpacaClient()
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd backend && python -m pytest test_alpaca.py -v
```

Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/alpaca_client.py backend/test_alpaca.py
git commit -m "feat: add AlpacaClient with TTL cache, type conversion, and error wrapping"
```

---

## Task 4: New API Endpoints

**Files:**
- Modify: `backend/app/api/v1/portfolio.py`
- Modify: `backend/test_alpaca.py` (add endpoint tests)

Two new routes added to the existing router:
- `GET /api/v1/portfolio/alpaca/positions` — returns `list[AlpacaPosition]`
- `GET /api/v1/portfolio/alpaca/summary` — returns `AlpacaSummary` (account + positions)

Both return HTTP 503 when Alpaca is unreachable.

**Note:** These routes must be registered **before** `/{portfolio_id}` routes in the file, otherwise FastAPI will try to match `"alpaca"` as a portfolio_id integer and return a 422.

- [ ] **Step 1: Add endpoint tests**

Append to `backend/test_alpaca.py`:

```python
from fastapi.testclient import TestClient


def _make_summary():
    from app.models.alpaca_schemas import AlpacaSummary, AlpacaPosition
    pos = AlpacaPosition(
        ticker="TSLA", shares=5.0, cost_basis=900.0,
        current_price=200.0, current_value=1000.0,
        gain_loss=100.0, gain_loss_percent=11.11,
        daily_change=15.0, daily_change_percent=1.5,
    )
    return AlpacaSummary(
        total_value=1000.0, total_cost=900.0,
        total_gain_loss=100.0, total_gain_loss_percent=11.11,
        daily_change=15.0, daily_change_percent=1.5,
        positions_count=1, account_mode="paper",
        positions=[pos],
    )


def test_alpaca_summary_endpoint_returns_200():
    from app.main import app
    from app.services.alpaca_client import alpaca_client

    with patch.object(alpaca_client, "get_summary", return_value=_make_summary()):
        client = TestClient(app)
        response = client.get("/api/v1/portfolio/alpaca/summary")

    assert response.status_code == 200
    data = response.json()
    assert data["account_mode"] == "paper"
    assert data["positions_count"] == 1
    assert data["positions"][0]["ticker"] == "TSLA"


def test_alpaca_summary_endpoint_returns_503_on_failure():
    from app.main import app
    from app.services.alpaca_client import alpaca_client, AlpacaUnavailableError

    with patch.object(alpaca_client, "get_summary", side_effect=AlpacaUnavailableError("timeout")):
        client = TestClient(app)
        response = client.get("/api/v1/portfolio/alpaca/summary")

    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"].lower()


def test_alpaca_positions_endpoint_returns_list():
    from app.main import app
    from app.services.alpaca_client import alpaca_client
    from app.models.alpaca_schemas import AlpacaPosition

    pos = AlpacaPosition(
        ticker="AAPL", shares=10.0, cost_basis=1500.0,
        current_price=155.0, current_value=1550.0,
        gain_loss=50.0, gain_loss_percent=3.33,
        daily_change=12.5, daily_change_percent=0.81,
    )
    with patch.object(alpaca_client, "get_positions", return_value=[pos]):
        client = TestClient(app)
        response = client.get("/api/v1/portfolio/alpaca/positions")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["ticker"] == "AAPL"
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd backend && python -m pytest test_alpaca.py -v -k "test_alpaca_summary_endpoint or test_alpaca_positions_endpoint"
```

Expected: `404 Not Found` (routes don't exist yet)

- [ ] **Step 3: Add routes to portfolio.py**

At the top of `backend/app/api/v1/portfolio.py`, add these imports after the existing imports:

```python
from app.services.alpaca_client import alpaca_client, AlpacaUnavailableError
from app.models.alpaca_schemas import AlpacaSummary, AlpacaPosition
```

Then add these two routes **before** the existing `@router.get("/{portfolio_id}")` route (insert after `router = APIRouter()`, before the first `@router.get("/")`):

```python
@router.get("/alpaca/summary", response_model=AlpacaSummary)
def get_alpaca_summary():
    """Get live portfolio summary from Alpaca Markets API."""
    try:
        return alpaca_client.get_summary()
    except AlpacaUnavailableError as e:
        raise HTTPException(status_code=503, detail=f"Alpaca unavailable: {e}")


@router.get("/alpaca/positions", response_model=list[AlpacaPosition])
def get_alpaca_positions():
    """Get live positions from Alpaca Markets API."""
    try:
        return alpaca_client.get_positions()
    except AlpacaUnavailableError as e:
        raise HTTPException(status_code=503, detail=f"Alpaca unavailable: {e}")
```

- [ ] **Step 4: Run all tests**

```bash
cd backend && python -m pytest test_alpaca.py -v
```

Expected: `10 passed`

- [ ] **Step 5: Manual smoke test**

Start the backend: `cd backend && uvicorn app.main:app --reload`

In another terminal:
```bash
curl http://localhost:8000/api/v1/portfolio/alpaca/summary
```

Expected: JSON with `total_value`, `positions`, `account_mode: "paper"`, etc.

- [ ] **Step 6: Commit**

```bash
git add backend/app/api/v1/portfolio.py backend/test_alpaca.py
git commit -m "feat: add /alpaca/summary and /alpaca/positions endpoints with 503 error handling"
```

---

## Task 5: Frontend Integration

**Files:**
- Modify: `frontend/lib/api/portfolio.ts`
- Modify: `frontend/app/page.tsx`

Add `alpacaAPI` to the existing `portfolioAPI` module and update the dashboard's portfolio section to use it. Add a paper/live badge to the UI.

- [ ] **Step 1: Add Alpaca types and API methods to portfolio.ts**

Append to `frontend/lib/api/portfolio.ts` (after the existing exports):

```typescript
export interface AlpacaPosition {
  ticker: string;
  shares: number;
  cost_basis: number;
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  daily_change: number;
  daily_change_percent: number;
}

export interface AlpacaSummary {
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  daily_change: number;
  daily_change_percent: number;
  positions_count: number;
  account_mode: 'paper' | 'live';
  positions: AlpacaPosition[];
}

export const alpacaAPI = {
  getSummary: () =>
    apiClient<AlpacaSummary>('/api/v1/portfolio/alpaca/summary'),

  getPositions: () =>
    apiClient<AlpacaPosition[]>('/api/v1/portfolio/alpaca/positions'),
};
```

- [ ] **Step 2: Read the current dashboard portfolio section**

Read `frontend/app/page.tsx` to find the `getPerformance` call and the Top Positions card. Identify:
- The import line for `portfolioAPI`
- The data-fetching call (likely `portfolioAPI.getPerformance(1)`)
- The JSX section rendering positions

- [ ] **Step 3: Update dashboard to use alpacaAPI**

In `frontend/app/page.tsx`:

a) Add `alpacaAPI` and `AlpacaSummary` to the import:
```typescript
import { portfolioAPI, alpacaAPI, AlpacaSummary } from '@/lib/api/portfolio';
```

b) Replace the `portfolioAPI.getPerformance(1)` call with:
```typescript
const summary = await alpacaAPI.getSummary();
```

c) Update the state type and all references from the old performance shape to `AlpacaSummary`. Field names are identical (`total_value`, `daily_change`, etc.) except positions now use `gain_loss`/`gain_loss_percent` instead of `profit_loss`/`profit_loss_percent`.

d) Add the account mode badge. In the portfolio card header, add:
```tsx
<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
  summary.account_mode === 'paper'
    ? 'bg-yellow-500/20 text-yellow-400'
    : 'bg-green-500/20 text-green-400'
}`}>
  {summary.account_mode === 'paper' ? 'Paper' : 'Live'}
</span>
```

- [ ] **Step 4: Handle the loading/error state**

Wrap the `alpacaAPI.getSummary()` call in a try/catch. When Alpaca is unavailable (503), render a fallback card:

```tsx
let summary: AlpacaSummary | null = null;
let alpacaError = false;
try {
  summary = await alpacaAPI.getSummary();
} catch {
  alpacaError = true;
}
```

In JSX, if `alpacaError`, render:
```tsx
<div className="text-sm text-muted-foreground">
  Portfolio data unavailable — Alpaca API unreachable.
</div>
```

- [ ] **Step 5: Verify in browser**

Start both servers:
```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:3000`. The dashboard portfolio card should show:
- Live equity value from your Alpaca paper account
- A yellow "Paper" badge (or green "Live" badge)
- Positions from your actual Alpaca account

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/api/portfolio.ts frontend/app/page.tsx
git commit -m "feat: connect dashboard to Alpaca live data with paper/live badge"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Add alpaca-py dependency | Task 1 |
| ALPACA_API_KEY/SECRET/BASE_URL in config | Task 1 |
| Centralized AlpacaClient | Task 3 |
| get_account(), get_positions(), get_portfolio_history() | Task 3 |
| Map Alpaca responses to Pydantic schema | Task 2 + 3 |
| String→float conversions | Task 3, Step 3 (`_map_position`, `_to_float`) |
| API endpoints updated | Task 4 |
| In-memory TTL cache | Task 3 |
| Error handling / 503 | Task 3 (`AlpacaUnavailableError`) + Task 4 |
| Frontend types and API calls | Task 5 |
| Paper vs Live badge in UI | Task 5, Step 3d |
| Local DB tables kept intact | Architectural decision — no DB changes in any task |
| Unit tests mocking TradingClient | Tasks 2–4 |

**Placeholder scan:** None found. All steps contain concrete code.

**Type consistency check:**
- `AlpacaPosition` defined in Task 2, used in Task 3 (`_map_position` return type), Task 4 (`response_model`), Task 5 (TypeScript interface mirrors it field-for-field)
- `AlpacaSummary` defined in Task 2, returned by `get_summary()` in Task 3, declared as `response_model` in Task 4, TypeScript interface in Task 5
- `AlpacaUnavailableError` defined in Task 3, caught in Task 4 endpoints, tested in Task 4
- `alpaca_client` singleton defined at bottom of Task 3 file, imported in Task 4, patched in Task 4 tests

All consistent.
