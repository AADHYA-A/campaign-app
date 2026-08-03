from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.services.llm_service import llm_service
from app.services.indic_trans import indic_translation
from app.core.database import get_async_session
from app.models.campaign import Campaign
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class CampaignRequest(BaseModel):
    topic: str
    tone: str = "professional"
    target_lang: str = "eng"
    
class CampaignResponse(BaseModel):
    id: str
    topic: str
    original_content: str
    translated_content: str
    sentiment: dict
    target_language: str
    created_at: datetime

@router.post("/campaign/generate", response_model=CampaignResponse)
async def generate_campaign(req: CampaignRequest, session: AsyncSession = Depends(get_async_session)):
    content = llm_service.generate_campaign_content(topic=req.topic, tone=req.tone)
    sentiment = llm_service.analyze_sentiment(content)
    translated = indic_translation.translate(
        text=content, 
        source_lang="eng", 
        target_lang=req.target_lang
    )
    
    new_campaign = Campaign(
        topic=req.topic,
        tone=req.tone,
        original_content=content,
        target_language=req.target_lang,
        translated_content=translated,
        sentiment_score=sentiment.get("confidence", 0.0),
        sentiment_label=sentiment.get("sentiment", "unknown")
    )
    
    session.add(new_campaign)
    await session.commit()
    await session.refresh(new_campaign)
    
    return CampaignResponse(
        id=new_campaign.id,
        topic=new_campaign.topic,
        original_content=new_campaign.original_content,
        translated_content=new_campaign.translated_content or "",
        sentiment={"sentiment": new_campaign.sentiment_label, "confidence": new_campaign.sentiment_score},
        target_language=new_campaign.target_language or "",
        created_at=new_campaign.created_at
    )

@router.get("/campaigns/history", response_model=List[CampaignResponse])
async def get_campaign_history(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(
        select(Campaign).order_by(Campaign.created_at.desc())
    )
    campaigns = result.scalars().all()
    
    return [
        CampaignResponse(
            id=c.id,
            topic=c.topic,
            original_content=c.original_content,
            translated_content=c.translated_content or "",
            sentiment={"sentiment": c.sentiment_label, "confidence": c.sentiment_score},
            target_language=c.target_language or "",
            created_at=c.created_at
        ) for c in campaigns
    ]
