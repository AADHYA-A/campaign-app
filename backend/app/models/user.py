from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String, Text, ForeignKey
from app.models.base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"

    # Profile fields
    full_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    organization = Column(String(255), nullable=True)
    preferred_language = Column(String(50), nullable=True, default="eng")
    department = Column(String(255), nullable=True)  # e.g. Marketing, Operations

    # Role — "user" (default), "manager", or "admin"
    # Permission hierarchy: admin > manager > user
    #   admin   : full platform access + user management
    #   manager : send notifications, launch distributions, view analytics
    #   user    : create campaigns, view own history, submit feedback
    role = Column(String(50), nullable=False, default="user", server_default="user")

    # Optional: which manager oversees this user (user → manager relationship)
    manager_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
