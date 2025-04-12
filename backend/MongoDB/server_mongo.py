from contextlib import asynccontextmanager
from datetime import datetime
import os
import sys

from bson import ObjectId
from fastapi import FastAPI, status, APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
load_dotenv()
from MongoDB.user_dal import User, UserDAL

COLLECTION_NAME = "user"
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "yolohome")
DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}

router = APIRouter(prefix="/api")

# Định nghĩa các model
class NewUser(BaseModel):
    no: int
    name: str
    email: str
    password: str
    username_adafruit: str
    key_adafruit: str

class NewUserResponse(BaseModel):
    id: str
    name: str

class UserUpdate(BaseModel):
    name: str
    email: str
    password: str
    username_adafruit: str
    key_adafruit: str

# Biến toàn cục để lưu trữ UserDAL
user_dal = None

# Dependency để lấy UserDAL
async def get_user_dal():
    return user_dal

@router.get("/users")
async def get_all_users(user_dal: UserDAL = Depends(get_user_dal)) -> list[User]:
    return [i async for i in user_dal.list_users()]

@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(new_user: NewUser, user_dal: UserDAL = Depends(get_user_dal)) -> NewUserResponse:
    user_id = str(ObjectId())  # Tạo ID mới
    await user_dal.create_user(
        id=user_id,
        no=new_user.no,
        name=new_user.name,
        email=new_user.email,
        password=new_user.password,
        username_adafruit=new_user.username_adafruit,
        key_adafruit=new_user.key_adafruit
    )
    return NewUserResponse(
        id=user_id,
        name=new_user.name,
    )

@router.get("/users/{user_no}")
async def get_user(user_no: int, user_dal: UserDAL = Depends(get_user_dal)) -> User:
    """Get a single user by no"""
    user = await user_dal.get_user(user_no)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User with no={user_no} not found")
    return user

@router.patch("/users/{user_no}")
async def update_user(user_no: int, user_update: UserUpdate, user_dal: UserDAL = Depends(get_user_dal)) -> User:
    # Tạo một đối tượng User từ UserUpdate
    user = User(
        id="temp_id",  # ID tạm thời, sẽ không được sử dụng
        no=user_no,
        name=user_update.name,
        email=user_update.email,
        password=user_update.password,
        username_adafruit=user_update.username_adafruit,
        key_adafruit=user_update.key_adafruit
    )
    return await user_dal.update_user(user_no, user)

@router.delete("/users/{user_no}")
async def delete_user(user_no: int, user_dal: UserDAL = Depends(get_user_dal)) -> bool:
    return await user_dal.delete_user(user_no)

# Khởi tạo MongoDB connection và UserDAL
async def init_db():
    global user_dal
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    database = client[os.getenv("DATABASE_NAME", "yolohome")]
    
    # Ensure the database is available:
    pong = await database.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("Cluster connection is not okay!")
    
    users = database.get_collection("user")
    user_dal = UserDAL(users)
    return client

