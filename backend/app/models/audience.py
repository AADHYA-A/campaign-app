from pydantic import BaseModel, Field
from typing import Optional


class AudienceMember(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    language_preference: str = Field(default="English")
    location: Optional[str] = None
    occupation: Optional[str] = None
