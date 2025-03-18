from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument

from pydantic import BaseModel

from uuid import uuid4

class User(BaseModel):
    id: str
    no: int
    name: str
    email: str
    password: str
    username_adafruit: str
    key_adafruit: str

    @staticmethod
    def from_doc(doc) -> "User":
        return User(
            id=str(doc["_id"]),
            no=doc["no"],
            name=doc["name"],
            email=doc["email"],
            password=doc["password"],
            username_adafruit=doc["username_adafruit"],
            key_adafruit=doc["key_adafruit"],
        )

class UserDAL:
    def __init__(self, user_collection: AsyncIOMotorCollection):
        self._user_collection = user_collection

    async def list_users(self, session=None):
        async for doc in self._user_collection.find(
            {},
            projection={
                "no": 1,
                "name": 1,
                "email": 1,
                "password": 1,
                "username_adafruit": 1,
                "key_adafruit": 1,
            },
            sort={"name": 1},
            session=session,
        ):
            yield User.from_doc(doc)


    async def get_user(self, no: int, session=None) -> User:
        doc = await self._user_collection.find_one(
            {"no": no},
            session=session,
        )
        return User.from_doc(doc)

    async def delete_user(self, no: int, session=None) -> bool:
        response = await self._user_collection.delete_one(
            {"no": no},
            session=session,
        )
        return response.deleted_count == 1

    async def create_user(
        self,
        id: str | ObjectId,
        no: int,
        name: str,
        email: str,
        password: str,
        username_adafruit: str,
        key_adafruit: str,
        session=None,
    ) -> User | None:
        doc = {
            "_id": ObjectId(id) if isinstance(id, str) else id,
            "no": no,
            "name": name,
            "email": email,
            "password": password,
            "username_adafruit": username_adafruit,
            "key_adafruit": key_adafruit,
        }
        result = await self._user_collection.insert_one(doc, session=session)
        if result.inserted_id:
            inserted_doc = await self._user_collection.find_one({"_id": result.inserted_id})
            return User.from_doc(inserted_doc)
        return None
    
    async def update_user(self, no: int, user: User, session=None) -> User | None:
        result = await self._user_collection.find_one_and_update(
            {"no": no},
            {"$set": {
                "name": user.name,
                "email": user.email,
                "password": user.password,
                "username_adafruit": user.username_adafruit,
                "key_adafruit": user.key_adafruit
            }},
            session=session,
            return_document=ReturnDocument.AFTER,
        )
        if result:
            return User.from_doc(result)
        return None



