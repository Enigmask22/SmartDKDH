import os
import aiohttp
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Tuple, Any
import mqtt_service as mqtt
import app_state

# Định nghĩa router
router = APIRouter()

# Model cho response
class SensorResponse(BaseModel):
    success: bool
    value: float
    unit: str

class SensorDevice:
    def __init__(self, feed_id: str, description: str, initial_value: float, unit: str,
                 username=None, key=None):
        self.feed_id = feed_id
        self.description = description
        self.value = initial_value
        self.unit = unit
        self.mqtt_service = mqtt.MQTTService(feed_id, str(initial_value), 
                                            username=username, key=key)

# Hàm lấy danh sách feed từ Adafruit
async def fetch_sensor_feeds(username=None, key=None):
    username = username or os.getenv("ADAFRUIT_USERNAME")
    key = key or os.getenv("ADAFRUIT_KEY")
    ADAFRUIT_FEEDS_URL = f"https://io.adafruit.com/api/v2/{username}/feeds"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            ADAFRUIT_FEEDS_URL,
            headers={"X-AIO-Key": key}
        ) as response:
            feeds = await response.json()
            
            # Lọc các feed sensor (nhiệt độ, ánh sáng, độ ẩm)
            sensor_feeds = []
            for feed in feeds:
                feed_key = feed.get("key", "")
                if feed_key in ["dadn-temp", "dadn-light", "dadn-humi"]:
                    feed_id = feed_key
                    description = get_sensor_description(feed_key)
                    last_value = float(feed.get("last_value", "0"))
                    unit = get_sensor_unit(feed_key)
                    sensor_feeds.append((feed_id, description, last_value, unit))
            
            return sensor_feeds

def get_sensor_description(feed_key: str) -> str:
    descriptions = {
        "dadn-temp": "Nhiệt độ",
        "dadn-light": "Ánh sáng",
        "dadn-humi": "Độ ẩm"
    }
    return descriptions.get(feed_key, "Sensor")

def get_sensor_unit(feed_key: str) -> str:
    units = {
        "dadn-temp": "°C",
        "dadn-light": "%",
        "dadn-humi": "%"
    }
    return units.get(feed_key, "")

@router.get("/sensor-devices")
async def get_sensor_devices():
    """Lấy danh sách các thiết bị cảm biến"""
    devices = []
    for device_id, device in app_state.sensor_devices.items():
        devices.append({
            "id": device_id,
            "description": device.description,
            "value": device.value,
            "unit": device.unit
        })
    return {"devices": devices}

@router.get("/sensor/{device_id}")
async def get_sensor_value(device_id: str):
    """Lấy giá trị của một cảm biến cụ thể"""
    if device_id not in app_state.sensor_devices:
        return {"success": False, "value": 0, "unit": ""}
    
    device = app_state.sensor_devices[device_id]
    latest_value = device.mqtt_service.get_latest_data()
    
    try:
        value = float(latest_value)
        device.value = value  # Cập nhật giá trị mới nhất
        return {
            "success": True,
            "value": value,
            "unit": device.unit
        }
    except (ValueError, TypeError):
        return {
            "success": False,
            "value": device.value,
            "unit": device.unit
        }