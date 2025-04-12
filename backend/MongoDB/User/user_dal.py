from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, AsyncGenerator, Annotated

from uuid import uuid4

# --- Cảnh báo Bảo mật ---
# Mật khẩu đang được lưu trữ và so sánh dưới dạng văn bản thuần.
# Đây là một rủi ro bảo mật lớn. Cần triển khai hashing mật khẩu (ví dụ: dùng passlib)
# để bảo vệ thông tin người dùng.
# ---

# === Validator Function ===
def objectid_to_str(v):
    """Chuyển đổi ObjectId sang str nếu cần."""
    if isinstance(v, ObjectId):
        return str(v)
    # Nếu không phải ObjectId, trả về giá trị gốc để Pydantic validate tiếp
    # Hoặc có thể raise ValueError nếu chỉ chấp nhận ObjectId hoặc str
    return v

# === User Model ===
class User(BaseModel):
    # Áp dụng validator cho trường id
    id: Annotated[str, BeforeValidator(objectid_to_str)] = Field(alias="_id")
    no: int
    name: str
    email: str
    password: str # !!! Mật khẩu plaintext - Cần được hash !!!
    username_adafruit: str
    key_adafruit: str

    model_config = ConfigDict(
        populate_by_name=True,
        # arbitrary_types_allowed=True, # Có thể không cần nữa với validator rõ ràng
        json_encoders={ObjectId: str}, # Vẫn giữ cho việc serialize ra JSON
        alias_generator=lambda field_name: field_name,
        by_alias=True # Giữ để serialize dùng alias _id
    )

    # Bỏ phương thức from_doc, Pydantic v2 xử lý tốt hơn với populate_by_name
    # @staticmethod
    # def from_doc(doc) -> "User": ...

class UserDAL:
    def __init__(self, user_collection: AsyncIOMotorCollection):
        self._user_collection = user_collection

    async def list_users(self, session=None) -> AsyncGenerator[User, None]:
        async for doc in self._user_collection.find({}, session=session):
            try:
                # Pydantic sẽ tự động gọi validator cho trường id
                yield User(**doc)
            except Exception as e:
                print(f"Lỗi khi tạo User model từ doc (list_users): {e}, doc: {doc}")
                # Bỏ qua bản ghi lỗi hoặc xử lý khác

    async def get_user(self, no: int, session=None) -> Optional[User]:
        doc = await self._user_collection.find_one({"no": no}, session=session)
        if doc:
            try:
                return User(**doc) # Pydantic tự xử lý
            except Exception as e:
                 print(f"Lỗi khi tạo User model từ doc (get_user): {e}, doc: {doc}")
                 return None
        return None

    async def get_user_by_email(self, email: str, session=None) -> Optional[User]:
        """Tìm người dùng bằng địa chỉ email."""
        doc = await self._user_collection.find_one({"email": email}, session=session)
        if doc:
            try:
                return User(**doc) # Pydantic tự xử lý
            except Exception as e:
                 print(f"Lỗi khi tạo User model từ doc (get_user_by_email): {e}, doc: {doc}")
                 return None
        return None

    async def delete_user(self, no: int, session=None) -> bool:
        response = await self._user_collection.delete_one({"no": no}, session=session)
        return response.deleted_count == 1

    async def create_user(
        self,
        # id sẽ được tạo tự động bởi MongoDB hoặc Pydantic nếu cần
        no: int,
        name: str,
        email: str,
        password: str, # !!! Cần hash mật khẩu trước khi gọi hàm này !!!
        username_adafruit: str,
        key_adafruit: str,
        session=None,
    ) -> User | None:
        # --- Cảnh báo Bảo mật ---
        # Mật khẩu được truyền vào đây nên là mật khẩu đã được hash.
        # ---
        user_data = { # Tạo dict thay vì User model trước
            "_id": ObjectId(), # Tạo ObjectId mới
            "no": no,
            "name": name,
            "email": email,
            "password": password, # Lưu mật khẩu (nên là hash)
            "username_adafruit": username_adafruit,
            "key_adafruit": key_adafruit
        }

        result = await self._user_collection.insert_one(user_data, session=session)
        if result.inserted_id:
            inserted_doc = await self._user_collection.find_one({"_id": result.inserted_id}, session=session)
            if inserted_doc:
                try:
                    return User(**inserted_doc) # Pydantic tự xử lý
                except Exception as e:
                     print(f"Lỗi khi tạo User model từ doc (create_user): {e}, doc: {inserted_doc}")
                     return None
        return None

    async def update_user(self, no: int, user_update_data: dict, session=None) -> User | None:
         # --- Cảnh báo Bảo mật ---
         # Nếu cập nhật mật khẩu, đảm bảo mật khẩu mới đã được hash.
         # ---
         # Chỉ cập nhật các trường được cung cấp trong user_update_data
         update_doc = {"$set": user_update_data}
         # Loại bỏ các trường không nên cập nhật trực tiếp nếu cần (ví dụ: _id, no)
         update_doc["$set"].pop("_id", None)
         update_doc["$set"].pop("id", None)
         update_doc["$set"].pop("no", None)

         result_doc = await self._user_collection.find_one_and_update(
             {"no": no},
             update_doc,
             session=session,
             return_document=ReturnDocument.AFTER,
         )
         if result_doc:
             try:
                 return User(**result_doc) # Pydantic tự xử lý
             except Exception as e:
                 print(f"Lỗi khi tạo User model từ doc (update_user): {e}, doc: {result_doc}")
                 return None
         return None



