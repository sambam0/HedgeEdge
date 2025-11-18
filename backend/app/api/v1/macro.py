from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.services.macro_service import macro_service

router = APIRouter()


@router.get("/indicators")
def get_economic_indicators() -> Dict:
    """Get current economic indicators"""
    try:
        indicators = macro_service.get_economic_indicators()
        return indicators
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/yield-curve")
def get_yield_curve() -> Dict:
    """Get treasury yield curve"""
    try:
        curve = macro_service.get_yield_curve()
        return curve
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{indicator}")
def get_indicator_history(indicator: str, periods: int = 12) -> List[Dict]:
    """Get historical data for an economic indicator"""
    try:
        history = macro_service.get_indicator_history(indicator, periods)
        if not history:
            raise HTTPException(status_code=404, detail=f"Indicator {indicator} not found")
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
