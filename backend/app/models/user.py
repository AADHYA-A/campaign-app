from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String, Text
from app.models.base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"

    # Profile fields
    full_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    organization = Column(String(255), nullable=True)
    preferred_language = Column(String(50), nullable=True, default="eng")

    # Role — "user" (default) or "admin"
    role = Column(String(50), nullable=False, default="user", server_default="user")
