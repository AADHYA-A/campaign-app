from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.core.database import engine
from app.models.base import Base

app = FastAPI(
    title="Multilingual Campaign Management API",
    description="Backend API for Campaign Management, Analytics, and Multilingual Content Generation.",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/backend")

@app.on_event("startup")
async def on_startup():
    """Verify database connectivity on application start."""
    try:
        async with engine.begin() as conn:
            # Creates tables if they don't exist yet (useful for dev without Alembic)
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Warning: Could not connect to database on startup. Ensure DATABASE_URL is set correctly. Error: {e}")

@app.get("/")
async def root():
    return {"message": "Welcome to Multilingual Campaign Management API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
