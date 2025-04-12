import asyncio
import os
import tempfile
import uvicorn
from fastapi import FastAPI, UploadFile, WebSocket, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import speech_recognition as sr
from pydub import AudioSegment

# Import các module đã tách
from Device import led_controller
from Device import fan_controller
from Device import sensor_controller  # Import module mới
import app_state

# Import server_mongo router và init_db
from MongoDB.server_mongo import router as mongo_router, init_db, get_user_dal
from MongoDB.dal import UserDAL, User

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        # Chỉ khởi tạo MongoDB connection
        mongo_client = await init_db()
        print("Connected to MongoDB")
    except Exception as e:
        print(f"Error initializing MongoDB: {e}")
    
    yield
    
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
    if 'mongo_client' in locals():
        mongo_client.close()

app = FastAPI(debug=True, lifespan=lifespan)

origins = [
    os.getenv("IP_ADDRESS"),
    os.getenv("EXPO_IP_ADDRESS")
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

# Thêm router thay vì mount
app.include_router(mongo_router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
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
        print(f"WebSocket error: {e}")

@app.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
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
        
        print(f"Saved audio to: {temp_audio_path}")

        # Kiểm tra file tồn tại
        if not os.path.exists(temp_audio_path):
            raise Exception(f"Audio file not found at {temp_audio_path}")

        # Chuyển đổi m4a sang wav
        try:
            audio_segment = AudioSegment.from_file(temp_audio_path, format="m4a")
            audio_segment.export(temp_wav_path, format="wav")
        except Exception as e:
            print(f"Detailed error: {str(e)}")
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
        
        return {"text": text, "command_type": command_type}
    except Exception as e:
        print(f"Error processing audio: {e}")
        return {"error": str(e)}

@app.post("/init-adafruit-connection")
async def init_adafruit_connection(user_no: int, user_dal: UserDAL = Depends(get_user_dal)):
    try:
        # Lấy thông tin user từ database
        user = await user_dal.get_user(user_no)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Lấy username và key Adafruit từ user
        username_adafruit = user.username_adafruit
        key_adafruit = user.key_adafruit
        
        if not username_adafruit or not key_adafruit:
            raise HTTPException(status_code=400, detail="Adafruit credentials not found")
        
        # Xóa các kết nối cũ nếu có
        for device in app_state.led_devices.values():
            if hasattr(device, 'mqtt_service') and device.mqtt_service:
                device.mqtt_service.client.disconnect()
        
        for device in app_state.fan_devices.values():
            if hasattr(device, 'mqtt_service') and device.mqtt_service:
                device.mqtt_service.client.disconnect()
        
        for device in app_state.sensor_devices.values():
            if hasattr(device, 'mqtt_service') and device.mqtt_service:
                device.mqtt_service.client.disconnect()
        
        # Reset các dictionary lưu trữ thiết bị
        app_state.led_devices.clear()
        app_state.fan_devices.clear()
        app_state.sensor_devices.clear()
        
        # Khởi tạo kết nối mới với username và key của user
        # LED devices
        led_feeds = await led_controller.fetch_led_feeds(username_adafruit, key_adafruit)
        for feed_id, description, last_value in led_feeds:
            app_state.led_devices[feed_id] = led_controller.LEDDevice(
                feed_id, description, last_value, username_adafruit, key_adafruit
            )
        
        # Fan devices
        fan_feeds = await fan_controller.fetch_fan_feeds(username_adafruit, key_adafruit)
        for feed_id, description, last_value in fan_feeds:
            app_state.fan_devices[feed_id] = fan_controller.FanDevice(
                feed_id, description, last_value, username_adafruit, key_adafruit
            )
        
        # Sensor devices
        sensor_feeds = await sensor_controller.fetch_sensor_feeds(username_adafruit, key_adafruit)
        for feed_id, description, last_value, unit in sensor_feeds:
            app_state.sensor_devices[feed_id] = sensor_controller.SensorDevice(
                feed_id, description, last_value, unit, username_adafruit, key_adafruit
            )
        
        return {
            "success": True,
            "message": "Adafruit connection initialized successfully",
            "devices": {
                "led": list(app_state.led_devices.keys()),
                "fan": list(app_state.fan_devices.keys()),
                "sensor": list(app_state.sensor_devices.keys())
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing Adafruit connection: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)