"""
main.py
-------
Idi ee whole backend ki "entry point" (start button).
Ee file ni run cheste, ee app "live" avuthundi, browser lo/Postman lo
requests ni accept cheyadam start chestundi.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.audience_routes import router as audience_router
from app.routes.auth_routes import router as auth_router
from app.routes.campaign_routes import router as campaign_router

# app ante ma FastAPI application ki "main object"
app = FastAPI(
    title="AI-Based Multilingual Mass Communication Platform",
    description="Backend API for campaign, audience & communication management",
    version="0.1.0",
)

# CORS ante: React (frontend, e.g. localhost:5173) nunchi
# FastAPI (backend, e.g. localhost:8000) ki request pampinapudu,
# browser normal ga block chestundi ("security" kosam).
# Ee CORSMiddleware aa block ni "allow" chestundi.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ee routers ni main app ki "plug-in" chestunnam
app.include_router(audience_router)
app.include_router(auth_router)
app.include_router(campaign_router)


@app.get("/")
async def root():
    """
    Idi oka simple 'health check' - server bagane run avthunda ledha ani
    test cheyadaniki. Browser lo localhost:8000 open cheste idi kanipistundi.
    """
    return {"message": "Backend server running fine! Audience Management API ready."}
