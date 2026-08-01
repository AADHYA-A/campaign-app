"""
auth_routes.py
---------------
Idi 3 endpoints istundi:
  POST /auth/register  -> kotha user account create cheyadam
  POST /auth/login      -> login chesi, oka token tesukovadam
  GET  /auth/me         -> "nenu evaro" ani token pettukoni adagadam (protected route)

Ee file chivarilo "require_role" ane oka helper kuda undi - idi tarvatha
(campaigns module lantivi build chesetappudu) "ee action ni admins matrame
cheyagalaru" లాంటి rules pettadaniki use avutundi.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.database import users_collection
from app.models.user import UserCreate, UserLogin, UserOut
from app.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Idi FastAPI ki "Authorization: Bearer <token>" header ni ela chadavalo cheptundi
security = HTTPBearer()


def user_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc["role"],
    }


# ---------- REGISTER ----------
@router.post("/register", response_model=UserOut)
async def register_user(user: UserCreate):
    # Ee email tho already account undha ani check cheyadam
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Ee email tho already account undi")

    user_dict = user.model_dump()
    # IMPORTANT: plain password ni ikkade "hash" chesi, database lo aa hash matrame save chestunnam
    user_dict["password"] = hash_password(user_dict["password"])

    new_user = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    return user_helper(created_user)


# ---------- LOGIN ----------
@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})

    # Purpose ga, "email kanapadaledu" ani, "password thappu" ani veru veru
    # error చెప్పam - idi security best practice (evariki teliyakunda undataniki
    # "e email register ayyindo ledho" ani evaraina guess cheyakunda).
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email leda password thappu")

    token = create_access_token({"user_id": str(user["_id"]), "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_helper(user),
    }


# ---------- CURRENT USER (protected route) ----------
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Idi oka 'dependency' - e route ki ee function ni add chesthamo, aa route
    accessing cheyalante, valid token undali. Frontend prati request tho
    'Authorization: Bearer <token>' header pampali.
    """
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token invalid leda expire ayindi")

    user = await users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    if user is None:
        raise HTTPException(status_code=401, detail="User kanapadaledu")

    return user_helper(user)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


def require_role(*allowed_roles: str):
    """
    Idi oka 'dependency factory' - tarvatha campaigns/content modules lo,
    'ee route ni admin, campaign_manager matrame vadagalaru' anataniki ilaa vadatam:

        @router.post("/campaigns/")
        async def create_campaign(user: dict = Depends(require_role("admin", "campaign_manager"))):
            ...
    """
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Ee action cheyadaniki '{current_user['role']}' role ki permission ledu",
            )
        return current_user

    return role_checker
