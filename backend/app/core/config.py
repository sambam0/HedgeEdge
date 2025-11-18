from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Keys
    ALPHA_VANTAGE_API_KEY: str
    FRED_API_KEY: str
    FMP_API_KEY: str
    NEWS_API_KEY: str

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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
