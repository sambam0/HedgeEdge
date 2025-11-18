from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base, engine
from app.api.v1 import market, portfolio, watchlist, macro, screener

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(market.router, prefix=f"{settings.API_V1_PREFIX}/market", tags=["market"])
app.include_router(portfolio.router, prefix=f"{settings.API_V1_PREFIX}/portfolio", tags=["portfolio"])
app.include_router(watchlist.router, prefix=f"{settings.API_V1_PREFIX}/watchlist", tags=["watchlist"])
app.include_router(macro.router, prefix=f"{settings.API_V1_PREFIX}/macro", tags=["macro"])
app.include_router(screener.router, prefix=f"{settings.API_V1_PREFIX}/screener", tags=["screener"])


@app.get("/")
def root():
    return {"message": "Principle Trading Terminal API", "version": "1.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
