from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multilingual Campaign Management"

    # Async URL for SQLAlchemy (asyncpg driver)
    DATABASE_URL: str = "postgresql+asyncpg://admin:adminpassword@localhost:5432/campaign_db"

    # Sync URL for Alembic migrations (psycopg2 driver)
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://admin:adminpassword@localhost:5432/campaign_db"

    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM – Ollama local inference
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3.1:latest"

    class Config:
        env_file = ".env"

import os

settings = Settings()

# Automatically configure databases for Vercel's built-in Postgres and KV Add-ons
if os.getenv("POSTGRES_URL"):
    # Convert Vercel's postgres:// URL to the drivers required by the backend
    raw_url = os.getenv("POSTGRES_URL")
    settings.DATABASE_URL = raw_url.replace("postgres://", "postgresql+asyncpg://")
    settings.SYNC_DATABASE_URL = raw_url.replace("postgres://", "postgresql+psycopg2://")

if os.getenv("KV_URL"):
    settings.REDIS_URL = os.getenv("KV_URL")
