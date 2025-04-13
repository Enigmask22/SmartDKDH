from fastapi import APIRouter
from pydantic import BaseModel
import aiohttp
import mqtt_service as mqtt
import app_state
import os

class FanResponse(BaseModel):
    success: bool
    status: str
    value: int

async def fetch_fan_feeds(username=None, key=None):
    username = username
    key = key
    ADAFRUIT_FEEDS_URL = f"https://io.adafruit.com/api/v2/{username}/feeds"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            ADAFRUIT_FEEDS_URL,
            headers={"X-AIO-Key": key}
        ) as response:
            feeds = await response.json()
            fan_feeds = [(feed["key"], feed["description"], feed["last_value"]) 
                        for feed in feeds if feed["key"].startswith("dadn-fan")]
            return fan_feeds

class FanDevice:
    def __init__(self, feed_id: str, description: str, initial_value: str,
                 username=None, key=None):
        self.feed_id = feed_id
        self.description = description
        self.mqtt_service = mqtt.MQTTService(feed_id, initial_status=initial_value, 
                                            username=username, key=key)
        self.value = int(initial_value)  # Lưu giá trị dạng số nguyên

router = APIRouter()

@router.get("/fan-devices")
async def get_fan_devices():
    return {
        "devices": [
            {
                "id": device_id,
                "description": device.description,
                "value": device.value
            }
            for device_id, device in app_state.fan_devices.items()
        ]
    }

@router.post("/fan/{device_id}/{action}", response_model=FanResponse)
async def control_fan(device_id: str, action: str):
    if device_id not in app_state.fan_devices:
        return {"success": False, "status": "device not found", "value": 0}
    
    device = app_state.fan_devices[device_id]
    current_value = device.value
    
    # Xử lý các action
    if action == "on":
        new_value = 50  # Mặc định bật ở mức 50%
    elif action == "off":
        new_value = 0
    elif action == "increase":
        new_value = min(100, current_value + 10)  # Tăng 10%, tối đa 100%
    elif action == "decrease":
        new_value = max(0, current_value - 10)  # Giảm 10%, tối thiểu 0%
    elif action.isdigit() and 0 <= int(action) <= 100:
        new_value = int(action)  # Đặt giá trị cụ thể
    else:
        return {"success": False, "status": "invalid action", "value": current_value}
    
    # Publish giá trị mới
    success = device.mqtt_service.publish_data(str(new_value))
    if success:
        device.value = new_value
        
    return {
        "success": success, 
        "status": "on" if new_value > 0 else "off", 
        "value": new_value
    }