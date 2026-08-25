from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as campaign_router
from app.api.auth import router as auth_router
from app.core.database import engine, get_async_session
from app.core.users import get_user_manager, get_user_db
from app.models.base import Base
# Import models so Base.metadata knows about them
import app.models.user  # noqa: F401
import app.models.campaign  # noqa: F401
import app.models.distribution  # noqa: F401
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

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


# ─── Seed users ────────────────────────────────────────────────────────────────
_SEED_USERS = [
    {
        "email": "admin@campaigns.hub",
        "password": "admin123",
        "full_name": "Admin",
        "organization": "Campaigns Hub",
        "department": "Operations",
        "role": "admin",
        "is_superuser": True,
        "is_verified": True,
    },
    {
        "email": "rajesh.kumar@campaigns.hub",
        "password": "manager123",
        "full_name": "Rajesh Kumar",
        "organization": "Sales Department",
        "department": "Sales",
        "role": "manager",
        "is_superuser": False,
        "is_verified": True,
    },
    {
        "email": "priya.patel@campaigns.hub",
        "password": "manager123",
        "full_name": "Priya Patel",
        "organization": "Marketing Department",
        "department": "Marketing",
        "role": "manager",
        "is_superuser": False,
        "is_verified": True,
    },
    {
        "email": "amit.verma@campaigns.hub",
        "password": "user123",
        "full_name": "Amit Verma",
        "organization": "Sales Department",
        "department": "Sales",
        "role": "user",
        "is_superuser": False,
        "is_verified": True,
    },
    {
        "email": "sneha.reddy@campaigns.hub",
        "password": "user123",
        "full_name": "Sneha Reddy",
        "organization": "Marketing Department",
        "department": "Marketing",
        "role": "user",
        "is_superuser": False,
        "is_verified": True,
    },
]


async def _seed_users():
    """Create default admin + demo users if they don't already exist."""
    try:
        from fastapi_users.password import PasswordHelper
        ph = PasswordHelper()

        async for session in get_async_session():
            try:
                for seed in _SEED_USERS:
                    result = await session.execute(
                        select(User).where(User.email == seed["email"])
                    )
                    existing = result.scalar_one_or_none()
                    if existing is None:
                        hashed_pw = ph.hash(seed["password"])
                        user = User(
                            email=seed["email"],
                            hashed_password=hashed_pw,
                            full_name=seed["full_name"],
                            organization=seed["organization"],
                            department=seed["department"],
                            role=seed["role"],
                            is_superuser=seed["is_superuser"],
                            is_verified=seed["is_verified"],
                            is_active=True,
                        )
                        session.add(user)
                        print(f"[seed] Created user: {seed['email']} (role={seed['role']})")
                    else:
                        # Ensure role/superuser flags are correct on existing users
                        updated = False
                        if existing.role != seed["role"]:
                            existing.role = seed["role"]
                            updated = True
                        if existing.is_superuser != seed["is_superuser"]:
                            existing.is_superuser = seed["is_superuser"]
                            updated = True
                        if existing.department != seed.get("department"):
                            existing.department = seed.get("department")
                            updated = True
                        if updated:
                            session.add(existing)
                            print(f"[seed] Updated user: {seed['email']}")
                await session.commit()
                print("[seed] User seeding complete.")
            except Exception as inner_e:
                await session.rollback()
                print(f"[seed] Error during seeding: {inner_e}")
            break  # only one session iteration needed
    except Exception as e:
        print(f"[seed] Could not seed users: {e}")


@app.on_event("startup")
async def on_startup():
    """Create tables and seed default users on startup."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[startup] Database tables ready.")
    except Exception as e:
        print(
            f"Warning: Could not connect to database on startup. "
            f"Ensure DATABASE_URL is set correctly. Error: {e}"
        )
        return

    # Seed admin + demo accounts
    await _seed_users()


@app.get("/")
async def root():
    return {"message": "Welcome to Multilingual Campaign Management API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
