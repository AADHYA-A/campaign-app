import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
try:
    from fastapi_users_db_sqlalchemy.generics import GUID
except ImportError:
    from sqlalchemy.types import String as GUID
from app.models.base import Base


class DistributionJob(Base):
    """
    Represents a multi-channel campaign distribution execution or schedule.
    """
    __tablename__ = "distribution_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(50), default="hin")

    # Selected channels: ["email", "sms", "whatsapp", "push", "web_broadcast"]
    channels = Column(JSON, nullable=False, default=list)

    # Schedule: "immediate" | "scheduled" | "recurring"
    schedule_type = Column(String(50), nullable=False, default="immediate")
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    recurring_frequency = Column(String(50), default="none")  # none, daily, weekly, monthly

    # Overall Status: "pending" | "in_progress" | "completed" | "failed" | "paused"
    status = Column(String(50), nullable=False, default="completed")

    # Counters
    total_recipients = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    retrying_count = Column(Integer, default=0)
    pending_count = Column(Integer, default=0)

    # Engagement Counters
    open_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    response_count = Column(Integer, default=0)

    # Channel-wise breakdown metadata JSON
    channel_metrics = Column(JSON, nullable=True, default=dict)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class DeliveryLog(Base):
    """
    Per-recipient delivery and engagement log.
    """
    __tablename__ = "delivery_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    distribution_id = Column(String(36), ForeignKey("distribution_jobs.id", ondelete="CASCADE"), nullable=False, index=True)

    recipient_identifier = Column(String(255), nullable=False)  # email, phone number, device token, user id
    recipient_name = Column(String(255), nullable=False, default="Audience Member")
    channel = Column(String(50), nullable=False)  # email, sms, whatsapp, push, web_broadcast
    language = Column(String(50), default="hin")

    # Delivery Status: "sent" | "delivered" | "failed" | "pending" | "retrying"
    status = Column(String(50), nullable=False, default="delivered")
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    latency_ms = Column(Integer, default=120)

    # Engagement flags & timestamps
    is_opened = Column(Integer, default=0)
    is_clicked = Column(Integer, default=0)
    has_response = Column(Integer, default=0)

    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)


class AudienceFeedback(Base):
    """
    Audience response and sentiment analysis log.
    """
    __tablename__ = "audience_feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    distribution_id = Column(String(36), ForeignKey("distribution_jobs.id", ondelete="CASCADE"), nullable=False, index=True)

    recipient_name = Column(String(255), nullable=False)
    channel = Column(String(50), nullable=False)
    language = Column(String(50), default="hin")

    feedback_text = Column(Text, nullable=False)
    sentiment = Column(String(50), nullable=False)  # positive, neutral, negative
    sentiment_score = Column(Float, default=0.85)
    key_theme = Column(String(100), default="General Feedback")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
