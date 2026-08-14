from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as campaign_router
from app.api.auth import router as auth_router
from app.core.database import engine
from app.models.base import Base
# Import models so Base.metadata knows about them
import app.models.user  # noqa: F401
import app.models.campaign  # noqa: F401

app = FastAPI(
    title="Multilingual Campaign Management API",
    description="Backend API for Campaign Management, Analytics, and Multilingual Content Generation.",
    version="0.1.0",
)

# CORS configuration — allow credentials for auth
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routes (register, login, logout, /users/me)
app.include_router(auth_router, prefix="/api/backend")

# Campaign routes
app.include_router(campaign_router, prefix="/api/backend")


@app.on_event("startup")
async def on_startup():
    """Create tables on startup (dev convenience — use Alembic in production)."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(
            f"Warning: Could not connect to database on startup. "
            f"Ensure DATABASE_URL is set correctly. Error: {e}"
        )


@app.get("/")
async def root():
    return {"message": "Welcome to Multilingual Campaign Management API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
