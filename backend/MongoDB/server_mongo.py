import os
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter
from dotenv import load_dotenv

# Import các thành phần cần thiết
from MongoDB.User.user_dal import UserDAL
# Import router từ user_api SẼ ĐƯỢC DI CHUYỂN XUỐNG DƯỚI

load_dotenv()

# Biến toàn cục để lưu trữ các đối tượng DAL
user_dal: UserDAL | None = None
# Thêm các biến DAL khác ở đây nếu cần (ví dụ: device_dal = None)

# Router chính của MongoDB module, tiền tố /api sẽ được thêm ở main.py
router = APIRouter()

# === Dependencies ===
# Định nghĩa dependency TRƯỚC khi import user_api
async def get_user_dal() -> UserDAL:
    """Dependency function để inject UserDAL vào các API endpoint."""
    if user_dal is None:
        # Trường hợp này không nên xảy ra nếu init_db được gọi đúng cách
        raise Exception("UserDAL chưa được khởi tạo.")
    return user_dal

# Thêm các dependency cho DAL khác ở đây nếu cần

# === Import API Routers ===
# Import router từ user_api SAU KHI get_user_dal đã được định nghĩa
from MongoDB.User.user_api import router as user_api_router

# === Database Initialization ===
async def init_db():
    """Khởi tạo kết nối MongoDB và các đối tượng DAL."""
    global user_dal
    # Thêm các global DAL khác ở đây nếu cần (ví dụ: global device_dal)

    mongo_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DATABASE_NAME", "yolohome")

    if not mongo_uri:
        raise ValueError("MONGODB_URI không được cấu hình trong biến môi trường.")

    client = AsyncIOMotorClient(mongo_uri)
    database = client[db_name]

    # Kiểm tra kết nối database
    try:
        await database.command("ping")
        print(f"Kết nối thành công tới MongoDB database: {db_name}")
    except Exception as e:
        raise Exception(f"Không thể kết nối tới MongoDB: {e}")

    # Khởi tạo UserDAL
    users_collection = database.get_collection("user")
    user_dal = UserDAL(users_collection)
    print("UserDAL đã được khởi tạo.")

    # Khởi tạo các DAL khác ở đây nếu cần
    # ví dụ: devices_collection = database.get_collection("devices")
    #       device_dal = DeviceDAL(devices_collection)

    # Trả về client để có thể đóng kết nối khi shutdown (trong main.py)
    return client

# === Include Routers ===
# Tích hợp router của user API vào router chính của MongoDB
router.include_router(user_api_router)

# Tích hợp các router khác ở đây nếu có
# ví dụ: router.include_router(device_api_router)

print("Router của MongoDB module đã được cấu hình.")