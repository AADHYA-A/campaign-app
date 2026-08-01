from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import audience_collection
from app.models.audience import AudienceMember

router = APIRouter(prefix="/audience", tags=["Audience Management"])


def audience_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc.get("email"),
        "phone": doc.get("phone"),
        "language_preference": doc.get("language_preference"),
        "location": doc.get("location"),
        "occupation": doc.get("occupation"),
    }


@router.post("/")
async def add_audience_member(member: AudienceMember):
    new_member = await audience_collection.insert_one(member.model_dump())
    created_member = await audience_collection.find_one({"_id": new_member.inserted_id})
    return audience_helper(created_member)


@router.get("/")
async def get_all_audience():
    members = []
    async for doc in audience_collection.find():
        members.append(audience_helper(doc))
    return members


@router.get("/{member_id}")
async def get_one_audience(member_id: str):
    doc = await audience_collection.find_one({"_id": ObjectId(member_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Audience member kanapadaledu")
    return audience_helper(doc)


@router.put("/{member_id}")
async def update_audience(member_id: str, member: AudienceMember):
    result = await audience_collection.update_one(
        {"_id": ObjectId(member_id)}, {"": member.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Audience member kanapadaledu")
    updated_doc = await audience_collection.find_one({"_id": ObjectId(member_id)})
    return audience_helper(updated_doc)


@router.delete("/{member_id}")
async def delete_audience(member_id: str):
    result = await audience_collection.delete_one({"_id": ObjectId(member_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audience member kanapadaledu")
    return {"message": "Audience member deleted successfully"}
