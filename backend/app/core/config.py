from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or a local .env file."""

    app_name: str = "CloudSync API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173"

    # Database and authentication settings for the upcoming implementation phases.
    database_url: str = "postgresql+psycopg://postgres:password@localhost:5432/cloudsync"
    jwt_secret_key: str = "development-only-change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Local storage is the default; S3 support will be implemented in a later phase.
    storage_backend: str = "local"
    aws_region: str = "ap-south-1"
    aws_s3_bucket: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        """Convert the comma-separated CORS setting into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return one cached settings instance for the application."""
    return Settings()
