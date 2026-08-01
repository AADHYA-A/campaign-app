"""
auth.py
-------
Idi "security guard" laantidi. Ikkada 2 chinna, kani chala important panulu chestam:

1. PASSWORD HASHING: Users password ni "plain text" (e.g. "mypassword123") ga
   database lo save cheyakudadu - evaraina database chusthe, andharu passwords
   choodagalaru ani. Bదulu, manam oka "hash" (oka scrambled, one-way version)
   save chestam. Login cheseppudu, user pettina password ni malli hash chesi,
   saved hash tho compare chestam.

   Analogy: Idi oka "shredder" laantidi - document ni shred cheste, malli tirigi
   original document ki convert cheyalem, kani rendu shredded pieces okate document
   nundi vacchaya ani confirm cheyagalam.

2. JWT TOKEN: User login ayyaka, prati request ki username/password malli malli
   pampakunda undataniki, oka "temporary ID card" (token) istam. Ee token lo
   user evaro, e role o (admin/manager/etc) encode chesi untundi, oka expiry
   time tho (e.g. 60 minutes tarvatha token invalid avutundi).
"""

import os
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# bcrypt ane algorithm vadi password hash chestam - idi industry-standard, secure choice
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Plain password ni, database lo save cheyadaniki 'hash' chestundi."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Login cheseppudu, user pettina password, saved hash tho match avthunda ani check chestundi."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """
    User login ayyaka, oka JWT token create chestundi.
    'data' lo usually user id mariyu role untayi.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Token ni verify chesi, andulo unna data (user id, role) ni thirigi istundi.
    Token invalid ayithe (expire ayina, tampered ayina) None istundi.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
