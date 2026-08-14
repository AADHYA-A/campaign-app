import uuid
from typing import Optional
from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    organization: Optional[str] = None
    preferred_language: Optional[str] = "eng"
    role: Optional[str] = "user"

    class Config:
        from_attributes = True


class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None
    organization: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    organization: Optional[str] = None
    preferred_language: Optional[str] = None
    role: Optional[str] = None
