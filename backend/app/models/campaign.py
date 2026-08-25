import uuid
from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey
from datetime import datetime, timezone
try:
    from fastapi_users_db_sqlalchemy.generics import GUID
except ImportError:
    from sqlalchemy.types import String as GUID
from app.models.base import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic = Column(String(255), nullable=False)
    tone = Column(String(100), nullable=False, default="professional")
    original_content = Column(Text, nullable=False)
    target_language = Column(String(50), nullable=True)
    translated_content = Column(Text, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    sentiment_label = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Optional owner — NULL means the campaign was created anonymously
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Admin approval status: pending | approved | rejected
    status = Column(String(20), nullable=False, default="pending", server_default="pending")

    # Admin review notes
    admin_note = Column(Text, nullable=True)

