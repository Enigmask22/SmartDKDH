from fastapi import APIRouter, Depends
from pydantic import BaseModel
import aiohttp
import mqtt_service as mqtt
import app_state
import os


class LEDResponse(BaseModel):
    success: bool
    status: str

class LEDDevice:
    def __init__(self, feed_id: str, description: str, initial_status: str, 
                 username=None, key=None):
        self.feed_id = feed_id
        self.description = description
        self.status = initial_status
        self.mqtt_service = mqtt.MQTTService(feed_id, initial_status, username, key)

async def fetch_led_feeds(username=None, key=None):
    username = username
    key = key
    ADAFRUIT_FEEDS_URL = f"https://io.adafruit.com/api/v2/{username}/feeds"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            ADAFRUIT_FEEDS_URL,
            headers={"X-AIO-Key": key}
        ) as response:
            feeds = await response.json()
            led_feeds = [(feed["key"], feed["description"], feed["last_value"]) 
                        for feed in feeds if feed["key"].startswith("dadn-led")]
            return led_feeds

router = APIRouter()

@router.get("/led-devices")
async def get_led_devices():
    return {
        "devices": [
            {
                "id": device_id,
                "description": device.description,
                "status": device.status
            }
            for device_id, device in app_state.led_devices.items()
        ]
    }

@router.post("/led/{device_id}/{status}", response_model=LEDResponse)
async def control_led(device_id: str, status: str):
    if device_id not in app_state.led_devices:
        return {"success": False, "status": "device not found"}
    if status not in ['0', '1']:
        return {"success": False, "status": "invalid status"}
    
    device = app_state.led_devices[device_id]
    success = device.mqtt_service.publish_data(status)
    if success:
        device.status = status
    return {"success": success, "status": status}