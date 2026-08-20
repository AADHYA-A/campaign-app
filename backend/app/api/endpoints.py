"""
endpoints.py — Campaign & Content API routes
Milestone 2: AI Content Generation & Multilingual Communication Engine
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.services.llm_service import llm_service
from app.services.indic_trans import indic_translation
from app.services.content_service import content_service
from app.services.distribution_service import distribution_service
from app.services.analytics_engine import analytics_engine
from app.services.feedback_service import feedback_service
from app.core.database import get_async_session
from app.core.users import optional_current_user, current_active_user
from app.models.campaign import Campaign
from app.models.distribution import DistributionJob, DeliveryLog, AudienceFeedback
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic request / response models
# ─────────────────────────────────────────────────────────────────────────────

class CampaignRequest(BaseModel):
    topic: str
    tone: str = "professional"
    target_lang: str = "hin"


class CampaignResponse(BaseModel):
    id: str
    topic: str
    original_content: str
    translated_content: str
    sentiment: dict
    target_language: str
    created_at: datetime
    user_id: Optional[str] = None


# ── Milestone 2: Full Pipeline ────────────────────────────────────────────────

class FullPipelineRequest(BaseModel):
    topic: str
    tone: str = "professional"
    target_lang: str = "hin"
    audience_type: str = "general_public"   # e.g. students, farmers, employees
    location: str = ""
    role: str = ""
    preferences: str = ""


class QualityCheckItem(BaseModel):
    pass_check: bool
    issues: List[str] = []

class FullPipelineResponse(BaseModel):
    topic: str
    tone: str
    target_language: str
    audience_type: str
    original_content: str
    translated_content: str
    personalized_content: str
    final_content: str
    sentiment: dict
    tone_analysis: dict
    quality_check: dict
    pipeline_steps: List[dict]
    campaign_id: Optional[str] = None


class TranslateRequest(BaseModel):
    content: str
    source_lang: str = "eng"
    target_lang: str = "hin"


class TranslateResponse(BaseModel):
    original: str
    translated: str
    source_language: str
    target_language: str


class PersonalizeRequest(BaseModel):
    content: str
    audience_type: str = "general_public"
    location: str = ""
    role: str = ""
    preferences: str = ""


class PersonalizeResponse(BaseModel):
    original: str
    personalized: str
    audience_type: str
    location: str
    role: str


class QualityCheckRequest(BaseModel):
    content: str


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    organization: Optional[str] = None
    preferred_language: Optional[str] = None
    role: Optional[str] = "user"
    is_active: bool
    is_superuser: bool
    is_verified: bool

    class Config:
        from_attributes = True


class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    full_name: Optional[str] = None
    organization: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Legacy campaign endpoint (kept for backward compatibility)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/campaign/generate", response_model=CampaignResponse, tags=["campaigns"])
async def generate_campaign(
    req: CampaignRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: Optional[User] = Depends(optional_current_user),
):
    content = await llm_service.generate_campaign_content(topic=req.topic, tone=req.tone)
    sentiment = await llm_service.analyze_sentiment(content)
    translated = indic_translation.translate(
        text=content,
        source_lang="eng",
        target_lang=req.target_lang,
    )

    new_campaign = Campaign(
        topic=req.topic,
        tone=req.tone,
        original_content=content,
        target_language=req.target_lang,
        translated_content=translated,
        sentiment_score=sentiment.get("confidence", 0.0),
        sentiment_label=sentiment.get("sentiment", "unknown"),
        user_id=str(current_user.id) if current_user else None,
    )

    session.add(new_campaign)
    await session.commit()

    campaign_id = new_campaign.id
    result = await session.execute(select(Campaign).where(Campaign.id == campaign_id))
    saved = result.scalar_one()

    return CampaignResponse(
        id=saved.id,
        topic=saved.topic,
        original_content=saved.original_content,
        translated_content=saved.translated_content or "",
        sentiment={"sentiment": saved.sentiment_label, "confidence": saved.sentiment_score},
        target_language=saved.target_language or "",
        created_at=saved.created_at,
        user_id=saved.user_id,
    )


@router.get("/campaigns/history", response_model=List[CampaignResponse], tags=["campaigns"])
async def get_campaign_history(
    session: AsyncSession = Depends(get_async_session),
    current_user: Optional[User] = Depends(optional_current_user),
):
    query = select(Campaign).order_by(Campaign.created_at.desc())

    if current_user:
        query = query.where(
            (Campaign.user_id == str(current_user.id)) | (Campaign.user_id == None)  # noqa: E711
        )

    result = await session.execute(query)
    campaigns = result.scalars().all()

    return [
        CampaignResponse(
            id=c.id,
            topic=c.topic,
            original_content=c.original_content,
            translated_content=c.translated_content or "",
            sentiment={"sentiment": c.sentiment_label, "confidence": c.sentiment_score},
            target_language=c.target_language or "",
            created_at=c.created_at,
            user_id=c.user_id,
        )
        for c in campaigns
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 2: Full AI Content Pipeline
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/content/generate",
    response_model=FullPipelineResponse,
    tags=["milestone2", "content"],
    summary="Full AI Pipeline: Generate → Translate → Personalise → Tone → QC",
)
async def generate_full_pipeline(
    req: FullPipelineRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: Optional[User] = Depends(optional_current_user),
):
    """
    Milestone 2 full pipeline:
    1. AI Content Generation (LLM)
    2. Multilingual Translation
    3. Audience Personalisation
    4. Sentiment & Tone Optimisation
    5. AI Quality & Compliance Check
    """
    result = await content_service.run_full_pipeline(
        topic=req.topic,
        tone=req.tone,
        target_lang=req.target_lang,
        audience_type=req.audience_type,
        location=req.location,
        role=req.role,
        preferences=req.preferences,
    )

    # Persist to campaigns table (using the final optimised content)
    sentiment = result["sentiment"]
    new_campaign = Campaign(
        topic=req.topic,
        tone=req.tone,
        original_content=result["final_content"],
        target_language=req.target_lang,
        translated_content=result["translated_content"],
        sentiment_score=sentiment.get("confidence", 0.0),
        sentiment_label=sentiment.get("sentiment", "unknown"),
        user_id=str(current_user.id) if current_user else None,
    )
    session.add(new_campaign)
    await session.commit()

    return FullPipelineResponse(
        **result,
        campaign_id=new_campaign.id,
    )


@router.post(
    "/content/translate",
    response_model=TranslateResponse,
    tags=["milestone2", "content"],
    summary="Translate content to an Indian language",
)
async def translate_content(req: TranslateRequest):
    """Translate any text into a supported Indian language."""
    result = await content_service.translate_only(
        content=req.content,
        source_lang=req.source_lang,
        target_lang=req.target_lang,
    )
    return TranslateResponse(**result)


@router.post(
    "/content/personalize",
    response_model=PersonalizeResponse,
    tags=["milestone2", "content"],
    summary="Personalise content for a specific audience",
)
async def personalize_content(req: PersonalizeRequest):
    """Rewrite content to be relevant for a specific audience segment."""
    result = await content_service.personalize_only(
        content=req.content,
        audience_type=req.audience_type,
        location=req.location,
        role=req.role,
        preferences=req.preferences,
    )
    return PersonalizeResponse(**result)


@router.post(
    "/content/quality-check",
    tags=["milestone2", "content"],
    summary="AI Quality & Compliance Check",
)
async def quality_check(req: QualityCheckRequest):
    """
    Run a full AI quality and compliance check on content.
    Checks: Grammar, Clarity, Tone, Sensitive Content, Facts, Policy Compliance.
    """
    result = await content_service.quality_check_only(content=req.content)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Admin: User Management (superuser-only)
# ─────────────────────────────────────────────────────────────────────────────

async def _require_admin(current_user: User = Depends(current_active_user)) -> User:
    """Dependency: ensures the caller is a superuser or has role=admin."""
    if not current_user.is_superuser and getattr(current_user, "role", "user") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


@router.get(
    "/admin/users",
    response_model=List[AdminUserResponse],
    tags=["admin"],
    summary="List all users (admin only)",
)
async def admin_list_users(
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(_require_admin),
):
    """Return all registered users. Requires admin or superuser role."""
    result = await session.execute(select(User).order_by(User.email))
    users = result.scalars().all()
    return [
        AdminUserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            organization=u.organization,
            preferred_language=u.preferred_language,
            role=getattr(u, "role", "user"),
            is_active=u.is_active,
            is_superuser=u.is_superuser,
            is_verified=u.is_verified,
        )
        for u in users
    ]


@router.patch(
    "/admin/users/{user_id}",
    response_model=AdminUserResponse,
    tags=["admin"],
    summary="Update user role / status (admin only)",
)
async def admin_update_user(
    user_id: str,
    update: AdminUserUpdate,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(_require_admin),
):
    """Update a user's role, active status, or superuser flag."""
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if update.role is not None:
        user.role = update.role
    if update.is_active is not None:
        user.is_active = update.is_active
    if update.is_superuser is not None:
        user.is_superuser = update.is_superuser
    if update.full_name is not None:
        user.full_name = update.full_name
    if update.organization is not None:
        user.organization = update.organization

    await session.commit()
    await session.refresh(user)

    return AdminUserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        organization=user.organization,
        preferred_language=user.preferred_language,
        role=getattr(user, "role", "user"),
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        is_verified=user.is_verified,
    )


@router.delete(
    "/admin/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["admin"],
    summary="Delete a user (admin only)",
)
async def admin_delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(_require_admin),
):
    """Permanently delete a user and cascade their campaigns to anonymous."""
    if str(current_admin.id) == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    await session.delete(user)
    await session.commit()


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 3: Multi-Channel Distribution & Engagement Analytics Platform
# ─────────────────────────────────────────────────────────────────────────────

class LaunchDistributionRequest(BaseModel):
    title: str
    content: str
    channels: List[str] = Field(default=["email", "sms", "whatsapp"])
    language: str = "hin"
    schedule_type: str = "immediate"  # immediate, scheduled, recurring
    scheduled_at: Optional[datetime] = None
    recurring_frequency: str = "none"  # none, daily, weekly, monthly
    audience_size: int = 250
    campaign_id: Optional[str] = None


class FeedbackSubmitRequest(BaseModel):
    recipient_name: str = "Audience Member"
    channel: str = "email"
    language: str = "hin"
    feedback_text: str


class ChannelTestRequest(BaseModel):
    channel: str = "email"
    test_recipient: Optional[str] = None


@router.post(
    "/channels/test",
    tags=["milestone3", "channels"],
    summary="Test Individual Channel Connectivity & Latency",
)
async def test_channel_route(
    req: ChannelTestRequest,
):
    """
    Milestone 3 Module 1: Test each channel before sending campaigns.
    Verifies gateway handshake, latency (ms), and payload formatting.
    """
    return await distribution_service.test_channel(
        channel=req.channel,
        test_recipient=req.test_recipient,
    )


@router.post(
    "/distribution/launch",
    tags=["milestone3", "distribution"],
    summary="Launch or Schedule a Multi-Channel Campaign Distribution",
)
async def launch_distribution_job(
    req: LaunchDistributionRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: Optional[User] = Depends(optional_current_user),
):
    """
    Milestone 3:
    1. Select Channels (Email, SMS, WhatsApp, Push Notification, Web Broadcast)
    2. Schedule Campaign (Immediate, Scheduled at Date/Time, Recurring)
    3. Automated Distribution (Dispatch through selected channels)
    4. Real-time Delivery Tracking (Sent, Delivered, Failed, Pending, Retrying)
    """
    job = await distribution_service.launch_distribution(
        session=session,
        title=req.title,
        content=req.content,
        channels=req.channels,
        language=req.language,
        schedule_type=req.schedule_type,
        scheduled_at=req.scheduled_at,
        recurring_frequency=req.recurring_frequency,
        audience_size=req.audience_size,
        campaign_id=req.campaign_id,
        user_id=str(current_user.id) if current_user else None,
    )

    return {
        "id": job.id,
        "title": job.title,
        "content": job.content,
        "channels": job.channels,
        "language": job.language,
        "schedule_type": job.schedule_type,
        "scheduled_at": job.scheduled_at.isoformat() if job.scheduled_at else None,
        "recurring_frequency": job.recurring_frequency,
        "status": job.status,
        "total_recipients": job.total_recipients,
        "sent_count": job.sent_count,
        "delivered_count": job.delivered_count,
        "failed_count": job.failed_count,
        "retrying_count": job.retrying_count,
        "pending_count": job.pending_count,
        "open_count": job.open_count,
        "click_count": job.click_count,
        "response_count": job.response_count,
        "channel_metrics": job.channel_metrics,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


@router.get(
    "/distribution/list",
    tags=["milestone3", "distribution"],
    summary="List all Campaign Distribution Jobs",
)
async def list_distribution_jobs(
    session: AsyncSession = Depends(get_async_session),
    current_user: Optional[User] = Depends(optional_current_user),
):
    """Return all past and active distribution jobs."""
    query = select(DistributionJob).order_by(DistributionJob.created_at.desc())
    if current_user:
        query = query.where(
            (DistributionJob.user_id == str(current_user.id)) | (DistributionJob.user_id == None)  # noqa: E711
        )
    result = await session.execute(query)
    jobs = result.scalars().all()

    return [
        {
            "id": j.id,
            "title": j.title,
            "content": j.content,
            "channels": j.channels,
            "language": j.language,
            "schedule_type": j.schedule_type,
            "scheduled_at": j.scheduled_at.isoformat() if j.scheduled_at else None,
            "recurring_frequency": j.recurring_frequency,
            "status": j.status,
            "total_recipients": j.total_recipients,
            "sent_count": j.sent_count,
            "delivered_count": j.delivered_count,
            "failed_count": j.failed_count,
            "retrying_count": j.retrying_count,
            "pending_count": j.pending_count,
            "open_count": j.open_count,
            "click_count": j.click_count,
            "response_count": j.response_count,
            "channel_metrics": j.channel_metrics,
            "created_at": j.created_at.isoformat() if j.created_at else None,
        }
        for j in jobs
    ]


@router.get(
    "/distribution/{job_id}",
    tags=["milestone3", "distribution"],
    summary="Get Distribution Job Details & Metrics",
)
async def get_distribution_job(
    job_id: str,
    session: AsyncSession = Depends(get_async_session),
):
    """Retrieve details, delivery counters, and channel metrics for a single job."""
    result = await session.execute(select(DistributionJob).where(DistributionJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Distribution job not found.")

    return {
        "id": job.id,
        "title": job.title,
        "content": job.content,
        "channels": job.channels,
        "language": job.language,
        "schedule_type": job.schedule_type,
        "scheduled_at": job.scheduled_at.isoformat() if job.scheduled_at else None,
        "recurring_frequency": job.recurring_frequency,
        "status": job.status,
        "total_recipients": job.total_recipients,
        "sent_count": job.sent_count,
        "delivered_count": job.delivered_count,
        "failed_count": job.failed_count,
        "retrying_count": job.retrying_count,
        "pending_count": job.pending_count,
        "open_count": job.open_count,
        "click_count": job.click_count,
        "response_count": job.response_count,
        "channel_metrics": job.channel_metrics,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


@router.get(
    "/distribution/{job_id}/logs",
    tags=["milestone3", "distribution"],
    summary="Get Real-Time Delivery Logs for a Job",
)
async def get_delivery_logs(
    job_id: str,
    channel: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Milestone 3 Step 4: Real-time status tracking for every message.
    Filter by channel, delivery status (sent, delivered, failed, pending, retrying), or recipient search.
    """
    query = select(DeliveryLog).where(DeliveryLog.distribution_id == job_id).order_by(DeliveryLog.sent_at.desc())

    if channel and channel != "all":
        query = query.where(DeliveryLog.channel == channel)
    if status_filter and status_filter != "all":
        query = query.where(DeliveryLog.status == status_filter)

    result = await session.execute(query)
    logs = result.scalars().all()

    if search:
        s = search.lower()
        logs = [
            l for l in logs
            if s in l.recipient_name.lower()
            or s in l.recipient_identifier.lower()
            or (l.failure_reason and s in l.failure_reason.lower())
        ]

    return [
        {
            "id": l.id,
            "recipient_identifier": l.recipient_identifier,
            "recipient_name": l.recipient_name,
            "channel": l.channel,
            "language": l.language,
            "status": l.status,
            "failure_reason": l.failure_reason,
            "retry_count": l.retry_count,
            "latency_ms": l.latency_ms,
            "is_opened": bool(l.is_opened),
            "is_clicked": bool(l.is_clicked),
            "has_response": bool(l.has_response),
            "sent_at": l.sent_at.isoformat() if l.sent_at else None,
            "delivered_at": l.delivered_at.isoformat() if l.delivered_at else None,
            "opened_at": l.opened_at.isoformat() if l.opened_at else None,
            "clicked_at": l.clicked_at.isoformat() if l.clicked_at else None,
        }
        for l in logs
    ]


@router.post(
    "/distribution/{job_id}/retry",
    tags=["milestone3", "distribution"],
    summary="One-Click Retry for Failed Messages",
)
async def retry_failed_distribution(
    job_id: str,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Retry all failed / retrying messages in a distribution job.
    """
    result = await distribution_service.retry_failed_messages(session=session, distribution_id=job_id)
    return result


@router.get(
    "/distribution/{job_id}/feedback",
    tags=["milestone3", "feedback"],
    summary="Get Audience Feedback & Sentiment Breakdown",
)
async def get_job_feedback(
    job_id: str,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Milestone 3 Step 6: Collect responses & analyze sentiment (Positive, Neutral, Negative).
    """
    result = await feedback_service.get_distribution_feedback(session=session, distribution_id=job_id)
    return result


@router.post(
    "/distribution/{job_id}/feedback",
    tags=["milestone3", "feedback"],
    summary="Submit Audience Feedback / Response",
)
async def submit_audience_feedback(
    job_id: str,
    req: FeedbackSubmitRequest,
    session: AsyncSession = Depends(get_async_session),
):
    """Submit audience response and run AI sentiment classification."""
    entry = await feedback_service.analyze_and_record_feedback(
        session=session,
        distribution_id=job_id,
        recipient_name=req.recipient_name,
        channel=req.channel,
        language=req.language,
        feedback_text=req.feedback_text,
    )
    return {
        "id": entry.id,
        "recipient_name": entry.recipient_name,
        "channel": entry.channel,
        "language": entry.language,
        "feedback_text": entry.feedback_text,
        "sentiment": entry.sentiment,
        "sentiment_score": entry.sentiment_score,
        "key_theme": entry.key_theme,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
    }


@router.get(
    "/analytics/overview",
    tags=["milestone3", "analytics"],
    summary="Get Platform-Wide Engagement Analytics & Insights",
)
async def get_analytics_overview(
    session: AsyncSession = Depends(get_async_session),
):
    """
    Milestone 3 Step 7: Comprehensive analytics platform:
    - Campaign Performance KPIs (Total Reach, Delivery %, Open %, CTR %, Response %)
    - Audience Trends & Time-Series Curves
    - Channel-wise Reach Comparison
    - Language-wise Engagement Breakdown
    - Sentiment Distribution
    """
    result = await analytics_engine.get_platform_overview(session=session)
    return result
