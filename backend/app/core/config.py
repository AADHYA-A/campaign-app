from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multilingual Campaign Management"

    # Async URL for SQLAlchemy (asyncpg driver)
    DATABASE_URL: str = "postgresql+asyncpg://admin:adminpassword@localhost:5432/campaign_db"

    # Sync URL for Alembic migrations (psycopg2 driver)
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://admin:adminpassword@localhost:5432/campaign_db"

    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "supersecretkey"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM – Ollama local inference
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3.1:latest"

    class Config:
        env_file = ".env"

settings = Settings()
