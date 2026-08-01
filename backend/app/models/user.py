"""
user.py (models)
-----------------
Idi "Audience" model laage, kani ee sari "Users" (login chese vaallu) kosam -
admins, campaign managers, communication team members.
"""

from pydantic import BaseModel, EmailStr
from typing import Literal


# Registration cheseppudu, user pampalsina data
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str  # idi plain text ga vastundi, kani save chese mundu "hash" chestam (App.py lo chuddam)
    role: Literal["admin", "campaign_manager", "communication_team"] = "communication_team"


# Login cheseppudu, user pampalsina data
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Frontend ki tirigi pampe data - IMPORTANT: idi lo password evvi undadu!
# (password ni evvariki, ekkadiki kuda pampakudadu, ide security lo oka golden rule)
class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
