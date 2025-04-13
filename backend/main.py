import asyncio
import os
import tempfile
import uvicorn
from fastapi import FastAPI, UploadFile, WebSocket, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import speech_recognition as sr
from pydub import AudioSegment
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

# Import các module đã tách
from Device import led_controller
from Device import fan_controller
from Device import sensor_controller  # Import module mới
import app_state

# Import server_mongo router và init_db
from MongoDB.server_mongo import router as mongo_router, init_db
from MongoDB.User.user_dal import UserDAL, User
from MongoDB.server_mongo import get_user_dal

# Import get_user_log_dal nếu cần dùng trực tiếp (ví dụ để ghi log trong main)
from MongoDB.server_mongo import get_user_log_dal
from MongoDB.UserLog.user_log_dal import UserLogDAL # Sửa đường dẫn import

# === Cấu hình Logging cơ bản ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__) # Tạo logger cho main.py

@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_client = None
    logger.info("--- Vercel Log: Lifespan startup initiated ---")
    try:
        logger.info("--- Vercel Log: Calling init_db from lifespan ---")
        mongo_client = await init_db()
        logger.info(f"--- Vercel Log: init_db call successful. mongo_client is {'SET' if mongo_client else 'NOT SET'}")
    except Exception as e:
        logger.critical(f"--- Vercel Log: CRITICAL ERROR during lifespan startup (init_db failed): {type(e).__name__} - {e} ---", exc_info=True)
        # Raise lại lỗi để làm server crash
        raise RuntimeError(f"Failed to initialize database during startup: {e}") from e

    logger.info("--- Vercel Log: Lifespan startup finished, yielding control ---")
    yield
    logger.info("--- Vercel Log: Lifespan shutdown initiated ---")
    # Shutdown - ngắt kết nối các thiết bị nếu có
    for device in app_state.led_devices.values():
        if hasattr(device, 'mqtt_service') and device.mqtt_service:
            device.mqtt_service.client.disconnect()
    
    for device in app_state.fan_devices.values():
        if hasattr(device, 'mqtt_service') and device.mqtt_service:
            device.mqtt_service.client.disconnect()
    
    for device in app_state.sensor_devices.values():
        if hasattr(device, 'mqtt_service') and device.mqtt_service:
            device.mqtt_service.client.disconnect()
    
    # Đóng kết nối MongoDB
    if mongo_client:
        logger.info("--- Vercel Log: Closing MongoDB client ---")
        mongo_client.close()
    else:
        logger.warning("--- Vercel Log: No MongoDB client to close (likely due to startup error) ---")
    logger.info("--- Vercel Log: Lifespan shutdown finished ---")

app = FastAPI(debug=True, lifespan=lifespan)

origins = [
    "*" # Vẫn giữ để cho phép mọi nguồn gốc (OK nếu có auth tốt)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm các router từ các module
app.include_router(led_controller.router)
app.include_router(fan_controller.router)
app.include_router(sensor_controller.router)  # Thêm router mới

# Thêm router chính của MongoDB (đã bao gồm user_api_router)
# Prefix /api sẽ được áp dụng cho tất cả các route trong mongo_router
app.include_router(mongo_router, prefix="/api")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket client connecting...")
    await websocket.accept()
    logger.info("WebSocket client connected.")
    try:
        while True:
            led_statuses = {
                device_id: device.mqtt_service.get_latest_data() 
                for device_id, device in app_state.led_devices.items()
            }
            fan_statuses = {
                device_id: device.mqtt_service.get_latest_data() 
                for device_id, device in app_state.fan_devices.items()
            }
            sensor_values = {
                device_id: device.mqtt_service.get_latest_data() 
                for device_id, device in app_state.sensor_devices.items()
            }
            await websocket.send_json({
                "led_statuses": led_statuses,
                "fan_statuses": fan_statuses,
                "sensor_values": sensor_values
            })
            await asyncio.sleep(1)
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        logger.info("WebSocket client disconnected.")

@app.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    logger.info("Received request for /speech-to-text")
    try:
        # Đọc file audio
        content = await audio.read()
        
        # Tạo temporary file với đường dẫn tuyệt đối
        temp_dir = tempfile.gettempdir()
        temp_audio_path = os.path.join(temp_dir, 'temp_audio.m4a')
        temp_wav_path = os.path.join(temp_dir, 'temp_audio.wav')

        # Ghi file audio
        with open(temp_audio_path, 'wb') as f:
            f.write(content)
        
        logger.info(f"Saved audio to: {temp_audio_path}")

        # Kiểm tra file tồn tại
        if not os.path.exists(temp_audio_path):
            raise Exception(f"Audio file not found at {temp_audio_path}")

        # Chuyển đổi m4a sang wav
        try:
            logger.info("Attempting audio conversion...")
            audio_segment = AudioSegment.from_file(temp_audio_path, format="m4a")
            audio_segment.export(temp_wav_path, format="wav")
            logger.info("Audio conversion successful.")
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}", exc_info=True)
            logger.warning("This might be due to missing ffmpeg/avconv in the Vercel environment.")
            raise Exception(f"Error converting audio: {str(e)}")

        # Nhận dạng giọng nói
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_wav_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language='vi-VN')

        # Xóa temporary files
        os.remove(temp_audio_path)
        os.remove(temp_wav_path)

        # Phân tích lệnh quạt và đèn
        normalized_text = text.lower()
        command_type = None
        
        if "quạt" in normalized_text:
            if "tắt" in normalized_text:
                command_type = "fan_off"
            elif "bật" in normalized_text or "mở" in normalized_text:
                command_type = "fan_on"
            elif "tăng" in normalized_text:
                command_type = "fan_increase"
            elif "giảm" in normalized_text:
                command_type = "fan_decrease"
        
        logger.info(f"Speech-to-text result: {text}")
        return {"text": text, "command_type": command_type}
    except Exception as e:
        logger.error(f"Error processing audio: {e}", exc_info=True)
        return {"error": str(e)}

# --- Model mới cho request body của API login/init ---
class InitConnectionRequest(BaseModel):
    email: EmailStr # Sử dụng EmailStr để validate email
    password: str

# --- Cập nhật API init_adafruit_connection ---
@app.post("/init-adafruit-connection")
async def init_adafruit_connection(
    request_body: InitConnectionRequest, # Thay user_no bằng request_body
    user_dal: UserDAL = Depends(get_user_dal),
    user_log_dal: UserLogDAL = Depends(get_user_log_dal)
):
    logger.info(f"Received request for /init-adafruit-connection for email: {request_body.email}")
    user: Optional[User] = None # Khởi tạo user là None
    try:
        # 1. Xác thực người dùng
        user = await user_dal.get_user_by_email(request_body.email)

        if user is None:
            logger.warning(f"Login attempt failed: Email not found '{request_body.email}'")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # !!! So sánh mật khẩu plaintext - RẤT KHÔNG AN TOÀN !!!

        # === Thêm log để debug ===
        logger.info("-" * 20)
        logger.info(f"DEBUG: Password từ Request : '{request_body.password}' (Length: {len(request_body.password)})")
        logger.info(f"DEBUG: Password từ Database: '{user.password}' (Length: {len(user.password)})")
        logger.info(f"DEBUG: So sánh bằng (==)   : {request_body.password == user.password}")
        logger.info("-" * 20)
        # === Kết thúc log debug ===

        if request_body.password != user.password:
             logger.warning(f"Login attempt failed: Incorrect password for user {user.no}")
             await user_log_dal.create_log(user_no=user.no, activity="Login attempt failed (incorrect password)", status="Failed")
             raise HTTPException(
                 status_code=status.HTTP_401_UNAUTHORIZED,
                 detail="Email hoặc mật khẩu không chính xác.",
                 headers={"WWW-Authenticate": "Bearer"},
             )

        # ---- Nếu xác thực thành công ----
        user_no = user.no # Lấy user_no từ user đã xác thực
        await user_log_dal.create_log(user_no=user_no, activity="Login successful, initiating Adafruit connection", status="Started")

        # 2. Lấy thông tin Adafruit từ user đã xác thực
        username_adafruit = user.username_adafruit
        key_adafruit = user.key_adafruit

        if not username_adafruit or not key_adafruit:
            await user_log_dal.create_log(user_no=user_no, activity="Initiating Adafruit connection", status="Failed", device_name="Credentials missing")
            raise HTTPException(status_code=400, detail="Thiếu thông tin Adafruit cho người dùng này.") # Lỗi 400 rõ ràng hơn

        # 3. Ngắt kết nối cũ (Giữ nguyên logic)
        # ... (copy code ngắt kết nối từ phiên bản trước) ...
        logger.info("Disconnecting existing devices...")
        for device_collection in [app_state.led_devices, app_state.fan_devices, app_state.sensor_devices]:
             for device_id, device in list(device_collection.items()):
                if hasattr(device, 'mqtt_service') and device.mqtt_service:
                    try:
                        if device.mqtt_service.client.is_connected():
                            device.mqtt_service.client.disconnect()
                            device.mqtt_service.client.loop_stop()
                        logger.info(f"Disconnected old device: {device_id}")
                    except Exception as disconnect_error:
                        logger.error(f"Error disconnecting device {device_id}: {disconnect_error}")
                if device_id in device_collection: # Kiểm tra lại trước khi xóa
                   del device_collection[device_id]
        logger.info("Finished disconnecting old devices.")


        # 4. Khởi tạo kết nối mới (Giữ nguyên logic)
        # ... (copy code khởi tạo kết nối LED, Fan, Sensor từ phiên bản trước) ...
        logger.info(f"Initializing new connections for user {user_no}...")
        # LED devices
        try:
            led_feeds = await led_controller.fetch_led_feeds(username_adafruit, key_adafruit)
            for feed_id, description, last_value in led_feeds:
                app_state.led_devices[feed_id] = led_controller.LEDDevice(
                    feed_id, description, last_value, username_adafruit, key_adafruit
                )
            logger.info(f"Initialized {len(led_feeds)} LED devices.")
        except Exception as e:
            logger.error(f"Error fetching/initializing LED feeds: {e}", exc_info=True)

        # Fan devices
        try:
            fan_feeds = await fan_controller.fetch_fan_feeds(username_adafruit, key_adafruit)
            for feed_id, description, last_value in fan_feeds:
                 app_state.fan_devices[feed_id] = fan_controller.FanDevice(
                     feed_id, description, last_value, username_adafruit, key_adafruit
                 )
            logger.info(f"Initialized {len(fan_feeds)} Fan devices.")
        except Exception as e:
             logger.error(f"Error fetching/initializing Fan feeds: {e}", exc_info=True)

        # Sensor devices
        try:
            sensor_feeds = await sensor_controller.fetch_sensor_feeds(username_adafruit, key_adafruit)
            for feed_id, description, last_value, unit in sensor_feeds:
                 app_state.sensor_devices[feed_id] = sensor_controller.SensorDevice(
                     feed_id, description, last_value, unit, username_adafruit, key_adafruit
                 )
            logger.info(f"Initialized {len(sensor_feeds)} Sensor devices.")
        except Exception as e:
             logger.error(f"Error fetching/initializing Sensor feeds: {e}", exc_info=True)


        # 5. Ghi log thành công
        logger.info(f"Login successful for user {user_no}. Initiating Adafruit connection...")
        await user_log_dal.create_log(
            user_no=user_no,
            activity="Adafruit connection initialized successfully",
            status="Success",
            device_name=f"LEDs: {len(app_state.led_devices)}, Fans: {len(app_state.fan_devices)}, Sensors: {len(app_state.sensor_devices)}"
        )

        # 6. Trả về kết quả
        return {
            "success": True,
            "message": "Kết nối Adafruit đã được khởi tạo thành công.",
            "user_no": user_no, # Trả về user_no để client biết ai đã login
            "devices": {
                "led": list(app_state.led_devices.keys()),
                "fan": list(app_state.fan_devices.keys()),
                "sensor": list(app_state.sensor_devices.keys())
            }
        }
    except HTTPException as he:
        # Ghi log lỗi HTTP đã biết (lỗi 401 đã được log ở trên)
        if he.status_code != status.HTTP_401_UNAUTHORIZED and user: # Chỉ log nếu không phải lỗi 401 hoặc user đã được tìm thấy
             await user_log_dal.create_log(user_no=(user.no if user else -1), activity="Initiating Adafruit connection", status="Failed", device_name=f"HTTP {he.status_code}: {he.detail}")
        raise he # Re-raise lỗi HTTP
    except Exception as e:
        logger.critical(f"Unexpected error in init_adafruit_connection for email {request_body.email}: {e}", exc_info=True)
        # Ghi log lỗi không mong đợi
        await user_log_dal.create_log(user_no=(user.no if user else -1), activity="Initiating Adafruit connection", status="Error", device_name=str(e))
        raise HTTPException(status_code=500, detail=f"Đã xảy ra lỗi không mong đợi: {str(e)}")

if __name__ == "__main__":
    # Phần này không chạy trên Vercel
    new_port = 8001
    logger.info(f"Attempting to start local server on 0.0.0.0:{new_port}")
    try:
         uvicorn.run("main:app", host="0.0.0.0", port=new_port, reload=True) # Thêm reload=True cho dev
    except OSError as e:
         logger.critical(f"Error starting local server on port {new_port}: {e}", exc_info=True)