from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "FORUM24 API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite+aiosqlite:///./forum24.db"

    secret_key: str = "dev-only-change-me"
    access_token_ttl_minutes: int = 480

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
        ]
    )

    seed_on_startup: bool = False
    public_base_url: str = "http://localhost:8000"

    # Background publisher: moves approved-and-scheduled articles live when due.
    scheduler_enabled: bool = True
    scheduler_interval_seconds: int = 60

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "prod"}

    @property
    def docs_enabled(self) -> bool:
        # The OpenAPI UI is useful in development; keep it off in production
        # unless the deployment explicitly opts in.
        return not self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()
