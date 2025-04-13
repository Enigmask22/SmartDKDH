import os
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter
import logging

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

# === Cấu hình Logging cơ bản ===
# Cấu hình để ghi ra stdout, Vercel sẽ thu thập
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__) # Tạo một logger cho module này

# === Dependencies ===
# Định nghĩa dependency TRƯỚC khi import các API router
async def get_user_dal() -> UserDAL:
    """Dependency function để inject UserDAL vào các API endpoint."""
    if user_dal is None:
        logger.error("Attempted to get UserDAL before initialization!")
        raise Exception("UserDAL chưa được khởi tạo.")
    return user_dal

async def get_user_log_dal() -> UserLogDAL:
    """Dependency function để inject UserLogDAL."""
    if user_log_dal is None:
        logger.error("Attempted to get UserLogDAL before initialization!")
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
    logger.info("--- Vercel Log: Starting init_db ---")
    try:
        # Đọc biến môi trường
        retrieved_uri = os.getenv("MONGODB_URI")

        # Log giá trị đọc được
        logger.info(f"--- Vercel Log: Value from os.getenv('MONGODB_URI'): {retrieved_uri}")

        # Sử dụng giá trị đọc được hoặc fallback
        mongo_uri = retrieved_uri or "mongodb+srv://superxayan2:yolohomedkdh@cluster0.r3bav.mongodb.net/"

        # Log giá trị URI cuối cùng sẽ được sử dụng
        if not retrieved_uri:
            logger.warning("--- Vercel Log: WARNING - Failed to read MONGODB_URI from environment, using default!")
        logger.info(f"--- Vercel Log: Using MongoDB URI: {'FROM ENV VAR' if retrieved_uri else 'FROM DEFAULT VALUE'}")

        db_name = os.getenv("DATABASE_NAME", "yolohome")
        logger.info(f"--- Vercel Log: DATABASE_NAME: {db_name}")

        if not mongo_uri:
            logger.critical("--- Vercel Log: CRITICAL - MongoDB URI is missing!")
            raise ValueError("MONGODB_URI không được cấu hình trong biến môi trường.")

        logger.info("--- Vercel Log: Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient(mongo_uri)
        logger.info("--- Vercel Log: Pinging database...")
        await client.admin.command('ping')
        logger.info("--- Vercel Log: Database ping successful.")

        database = client[db_name]
        logger.info(f"--- Vercel Log: Selected database: {db_name}")

        # Khởi tạo UserDAL
        logger.info("--- Vercel Log: Initializing UserDAL...")
        users_collection = database.get_collection("user")
        user_dal = UserDAL(users_collection)
        logger.info(f"--- Vercel Log: UserDAL initialized: {user_dal is not None}")

        # Khởi tạo UserLogDAL
        logger.info("--- Vercel Log: Initializing UserLogDAL...")
        user_logs_collection = database.get_collection("user_log")
        user_log_dal = UserLogDAL(user_logs_collection)
        logger.info(f"--- Vercel Log: UserLogDAL initialized: {user_log_dal is not None}")

        logger.info("--- Vercel Log: init_db finished successfully ---")
        return client

    except Exception as e:
        logger.critical(f"--- Vercel Log: CRITICAL ERROR in init_db: {type(e).__name__} - {e} ---", exc_info=True)
        raise e

# === Include Routers ===
# Tích hợp router của user API vào router chính của MongoDB
router.include_router(user_api_router)

# Tích hợp router của user log API
router.include_router(user_log_api_router)

# Tích hợp các router khác ở đây nếu có
# ví dụ: router.include_router(device_api_router)

print("Router của MongoDB module đã được cấu hình.")