from datetime import datetime
from typing import Optional, AsyncGenerator
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId # Để tạo _id

# Pydantic model cho UserLog
class UserLog(BaseModel):
    id: str = Field(alias="_id") # Sử dụng alias để map với _id của MongoDB
    user_no: int # Tham chiếu đến User bằng user_no
    activity: str # Mô tả hoạt động (ví dụ: "Bật đèn", "Tắt quạt", "Điều chỉnh nhiệt độ")
    status: str # Trạng thái (ví dụ: "Thành công", "Thất bại", "Đang xử lý")
    timestamp: datetime = Field(default_factory=datetime.utcnow) # Thời gian ghi log
    device_name: Optional[str] = None # Tên hoặc ID của thiết bị liên quan (có thể null)

    # Sử dụng model_config thay cho class Config trong Pydantic v2
    model_config = ConfigDict(
        populate_by_name=True,  # Tương đương allow_population_by_field_name
        arbitrary_types_allowed=True, # Thường cần thiết khi dùng datetime, ObjectId
        json_encoders={ObjectId: str, datetime: lambda dt: dt.isoformat()},
        alias_generator=lambda field_name: field_name, # Giữ nguyên tên trường nếu không có alias
        by_alias=True # <--- Thêm dòng này để serialize dùng alias
    )

# Data Access Layer cho UserLog
class UserLogDAL:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create_log(
        self,
        user_no: int,
        activity: str,
        status: str,
        device_name: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> UserLog:
        """Tạo một bản ghi log mới."""
        log_id = str(ObjectId()) # Tạo ID mới cho log
        log_data = {
            "_id": log_id,
            "user_no": user_no,
            "activity": activity,
            "status": status,
            "timestamp": timestamp or datetime.utcnow(),
            "device_name": device_name,
        }
        await self.collection.insert_one(log_data)
        # Trả về đối tượng UserLog đã tạo (lấy từ dữ liệu đã chuẩn bị)
        return UserLog(**log_data)

    async def get_logs_by_user(self, user_no: int, limit: int = 100, skip: int = 0) -> AsyncGenerator[UserLog, None]:
        """Lấy danh sách log của một user cụ thể, phân trang."""
        cursor = self.collection.find({"user_no": user_no}).sort("timestamp", -1).skip(skip).limit(limit)
        async for log_doc in cursor:
            yield UserLog(**log_doc)

    async def get_all_logs(self, limit: int = 100, skip: int = 0) -> AsyncGenerator[UserLog, None]:
        """Lấy danh sách tất cả log, phân trang."""
        cursor = self.collection.find().sort("timestamp", -1).skip(skip).limit(limit)
        async for log_doc in cursor:
            yield UserLog(**log_doc)

    async def get_log_by_id(self, log_id: str) -> Optional[UserLog]:
        """Lấy một log cụ thể bằng ID của nó."""
        log_doc = await self.collection.find_one({"_id": log_id})
        if log_doc:
            return UserLog(**log_doc)
        return None

    # Có thể thêm các phương thức khác nếu cần, ví dụ: xóa log, tìm log theo khoảng thời gian, ...
