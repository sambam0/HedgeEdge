from fastapi import APIRouter
from app.services.macro_service import macro_service

router = APIRouter()


@router.get("/indicators")
def get_all_indicators():
    """Get all macro indicators"""
    return macro_service.get_all_indicators()


@router.get("/fed-funds-rate")
def get_fed_funds_rate():
    """Get Federal Funds Rate"""
    return macro_service.get_fed_funds_rate()


@router.get("/inflation")
def get_inflation():
    """Get inflation data (CPI and PCE)"""
    return macro_service.get_inflation_data()


@router.get("/unemployment")
def get_unemployment():
    """Get unemployment rate"""
    return macro_service.get_unemployment_rate()


@router.get("/gdp")
def get_gdp():
    """Get GDP growth rate"""
    return macro_service.get_gdp_growth()


@router.get("/treasury-yields")
def get_treasury_yields():
    """Get treasury yield curve"""
    return macro_service.get_treasury_yields()
