from typing import AsyncGenerator
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

# On Vercel (serverless), each function invocation is stateless — we must use
# NullPool so connections are never pooled across invocations. Persistent pool
# settings (pool_size / max_overflow) cause "connection refused" on cold starts.
_is_serverless = bool(os.getenv("VERCEL"))

if _is_serverless:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        poolclass=NullPool,  # No connection pooling in serverless
    )
else:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
        pool_size=5,
        max_overflow=10,
    )

async_session_maker = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
