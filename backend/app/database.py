import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = AsyncIOMotorClient(MONGO_URI)
database = client[DATABASE_NAME]

users_collection = database.get_collection("users")
audience_collection = database.get_collection("audience")
campaigns_collection = database.get_collection("campaigns")
