"""
campaign_routes.py
--------------------
Audience routes laage CRUD undi, kani oka important difference:

  - GET (list/view) -> evaraina (login ayina evaraina) chuడవచ్చు
  - POST/PUT/DELETE (create/edit/delete) -> "admin" leda "campaign_manager"
    role unna vaalle cheyagalaru (require_role dependency vాడi)

Idi "role-based access control" ane concept ki oka real example -
project document lo Week 1-2 lo cheppina requirement idే.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from app.database import campaigns_collection
from app.models.campaign import CampaignCreate
from app.routes.auth_routes import require_role, get_current_user

router = APIRouter(prefix="/campaigns", tags=["Campaign Management"])


def campaign_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc["description"],
        "campaign_type": doc["campaign_type"],
        "target_language": doc["target_language"],
        "status": doc["status"],
        "created_by": doc.get("created_by"),
        "created_at": doc.get("created_at"),
    }


# ---------- CREATE (protected: admin, campaign_manager matrame) ----------
@router.post("/")
async def create_campaign(
    campaign: CampaignCreate,
    current_user: dict = Depends(require_role("admin", "campaign_manager")),
):
    campaign_dict = campaign.model_dump()
    campaign_dict["created_by"] = current_user["name"]
    campaign_dict["created_at"] = datetime.now(timezone.utc).isoformat()

    new_campaign = await campaigns_collection.insert_one(campaign_dict)
    created = await campaigns_collection.find_one({"_id": new_campaign.inserted_id})
    return campaign_helper(created)


# ---------- READ (all) - login ayina evaraina chudavachu ----------
@router.get("/")
async def get_all_campaigns(current_user: dict = Depends(get_current_user)):
    campaigns = []
    async for doc in campaigns_collection.find().sort("created_at", -1):
        campaigns.append(campaign_helper(doc))
    return campaigns


# ---------- UPDATE (protected) ----------
@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    campaign: CampaignCreate,
    current_user: dict = Depends(require_role("admin", "campaign_manager")),
):
    result = await campaigns_collection.update_one(
        {"_id": ObjectId(campaign_id)}, {"$set": campaign.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign kanapadaledu")
    updated = await campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
    return campaign_helper(updated)


# ---------- DELETE (protected) ----------
@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    current_user: dict = Depends(require_role("admin", "campaign_manager")),
):
    result = await campaigns_collection.delete_one({"_id": ObjectId(campaign_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign kanapadaledu")
    return {"message": "Campaign deleted successfully"}
