import os
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter

# Import các thành phần cần thiết
from MongoDB.User.user_dal import UserDAL

# Import các thành phần của UserLog
from MongoDB.UserLog.user_log_dal import UserLogDAL
# Import router từ user_log_api SẼ ĐƯỢC DI CHUYỂN XUỐNG DƯỚI

# Biến toàn cục để lưu trữ các đối tượng DAL
user_dal: UserDAL | None = None
user_log_dal: UserLogDAL | None = None
# Thêm các biến DAL khác ở đây nếu cần (ví dụ: device_dal = None)

# Router chính của MongoDB module, tiền tố /api sẽ được thêm ở main.py
router = APIRouter()

# === Dependencies ===
# Định nghĩa dependency TRƯỚC khi import các API router
async def get_user_dal() -> UserDAL:
    """Dependency function để inject UserDAL vào các API endpoint."""
    if user_dal is None:
        # Trường hợp này không nên xảy ra nếu init_db được gọi đúng cách
        raise Exception("UserDAL chưa được khởi tạo.")
    return user_dal

async def get_user_log_dal() -> UserLogDAL:
    """Dependency function để inject UserLogDAL."""
    if user_log_dal is None:
        raise Exception("UserLogDAL chưa được khởi tạo.")
    return user_log_dal

# Thêm các dependency cho DAL khác ở đây nếu cần

# === Import API Routers ===
# Import các router SAU KHI các dependency đã được định nghĩa
from MongoDB.User.user_api import router as user_api_router
from MongoDB.UserLog.user_log_api import router as user_log_api_router

# === Database Initialization ===
async def init_db():
    """Khởi tạo kết nối MongoDB và các đối tượng DAL."""
    global user_dal, user_log_dal
    print("--- Vercel Log: Starting init_db ---") # Log bắt đầu
    try:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb+srv://superxayan2:yolohomedkdh@cluster0.r3bav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db_name = os.getenv("DATABASE_NAME", "yolohome")
        # Không in URI đầy đủ ra log vì lý do bảo mật
        print(f"--- Vercel Log: MONGODB_URI is {'SET' if mongo_uri else 'NOT SET'}")
        print(f"--- Vercel Log: DATABASE_NAME: {db_name}")

        if not mongo_uri:
            print("--- Vercel Log: CRITICAL - MONGODB_URI not found in environment variables!")
            raise ValueError("MONGODB_URI không được cấu hình trong biến môi trường.")

        print("--- Vercel Log: Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient(mongo_uri)
        database = client[db_name]
        print(f"--- Vercel Log: Selected database: {db_name}")

        # Kiểm tra kết nối database
        print("--- Vercel Log: Pinging database...")
        pong = await database.command("ping")
        print(f"--- Vercel Log: Database ping response: {pong}")
        if int(pong["ok"]) != 1:
             print("--- Vercel Log: CRITICAL - Database ping failed!")
             raise Exception("Cluster connection is not okay!")
        print("--- Vercel Log: Database ping successful.")

        # Khởi tạo UserDAL
        print("--- Vercel Log: Initializing UserDAL...")
        users_collection = database.get_collection("user")
        user_dal = UserDAL(users_collection) # Gán giá trị
        print(f"--- Vercel Log: UserDAL initialized: {user_dal is not None}")

        # Khởi tạo UserLogDAL
        print("--- Vercel Log: Initializing UserLogDAL...")
        user_logs_collection = database.get_collection("user_log")
        user_log_dal = UserLogDAL(user_logs_collection) # Gán giá trị
        print(f"--- Vercel Log: UserLogDAL initialized: {user_log_dal is not None}")

        print("--- Vercel Log: init_db finished successfully ---")
        return client

    except Exception as e:
        print(f"--- Vercel Log: CRITICAL ERROR in init_db: {type(e).__name__} - {e} ---")
        # Raise lại lỗi để lifespan biết có vấn đề
        raise e

# === Include Routers ===
# Tích hợp router của user API vào router chính của MongoDB
router.include_router(user_api_router)

# Tích hợp router của user log API
router.include_router(user_log_api_router)

# Tích hợp các router khác ở đây nếu có
# ví dụ: router.include_router(device_api_router)

print("Router của MongoDB module đã được cấu hình.")