import uuid
from sqlalchemy import Column, String, Text, DateTime, Float
from datetime import datetime, timezone
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
