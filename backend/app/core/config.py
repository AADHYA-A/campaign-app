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

    # LLM – Google Gemini (cloud inference — works on Vercel)
    # Get a free key at: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"

import os

settings = Settings()

# Automatically configure databases for Vercel's built-in Postgres and KV Add-ons
if os.getenv("POSTGRES_URL"):
    raw_url = os.getenv("POSTGRES_URL")
    # Normalize postgres:// to postgresql:// first if it exists
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
    
    # Replace the standard postgresql:// prefix with the appropriate async/sync driver scheme
    if raw_url.startswith("postgresql://"):
        settings.DATABASE_URL = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        settings.SYNC_DATABASE_URL = raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        # Fallback if it's already using a custom driver or scheme
        settings.DATABASE_URL = raw_url
        settings.SYNC_DATABASE_URL = raw_url

if os.getenv("KV_URL"):
    settings.REDIS_URL = os.getenv("KV_URL")
