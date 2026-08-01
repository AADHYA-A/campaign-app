"""
campaign.py (models)
---------------------
Campaign ante oka "message batch" - example: "Diwali Awareness Drive",
"Flood Emergency Alert", "New Policy Announcement" - ivi anni "campaigns".

Project document lo cheppinattu, 4 types of campaigns untayi:
  - awareness_drive
  - emergency_alert
  - educational_notification
  - organizational_announcement
"""

from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class CampaignCreate(BaseModel):
    title: str
    description: str
    campaign_type: Literal[
        "awareness_drive",
        "emergency_alert",
        "educational_notification",
        "organizational_announcement",
    ]
    target_language: str = "English"
    status: Literal["draft", "scheduled", "sent"] = "draft"


class CampaignOut(BaseModel):
    id: str
    title: str
    description: str
    campaign_type: str
    target_language: str
    status: str
    created_by: Optional[str] = None
    created_at: Optional[str] = None
