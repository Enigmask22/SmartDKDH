import sys
import os
from Adafruit_IO import MQTTClient
from dotenv import load_dotenv
load_dotenv()

class MQTTService:
    def __init__(self, feed_id, initial_status, username=os.getenv("ADAFRUIT_USERNAME"), key=os.getenv("ADAFRUIT_KEY")):
        self.AIO_FEED_ID = feed_id
        # self.AIO_FEED_ID = "dadn-led-1"
        self.AIO_USERNAME = username
        # self.AIO_USERNAME = "BachbeastCE"
        self.AIO_KEY = key
        # self.AIO_KEY = "aio_eaue76HZurAww7Kso1LWJUbRs8Q8"
        self.latest_data = initial_status  # Sử dụng giá trị từ Adafruit
        self.setup_client()

    def connected(self, client):
        print(f"Kết nối thành công đến {self.AIO_FEED_ID}...")
        client.subscribe(self.AIO_FEED_ID)

    def subscribe(self, client, userdata, mid, granted_qos):
        print(f"Subscribe thành công đến {self.AIO_FEED_ID}...")

    def disconnected(self, client):
        print(f"Ngắt kết nối từ {self.AIO_FEED_ID}...")
        # Không gọi sys.exit(1) để tránh tắt toàn bộ ứng dụng
        # sys.exit(1)

    def message(self, client, feed_id, payload):
        print(f"Nhận dữ liệu từ {feed_id}: {payload}")
        self.latest_data = payload

    def get_latest_data(self):
        return self.latest_data

    def publish_data(self, value):
        try:
            self.client.publish(self.AIO_FEED_ID, value)
            self.latest_data = value
            print(f"Đã publish {value} đến {self.AIO_FEED_ID}")
            return True
        except Exception as e:
            print(f"Lỗi khi publish đến {self.AIO_FEED_ID}: {e}")
            return False

    def setup_client(self):
        self.client = MQTTClient(self.AIO_USERNAME, self.AIO_KEY)
        self.client.on_connect = self.connected
        self.client.on_disconnect = self.disconnected
        self.client.on_message = self.message
        self.client.on_subscribe = self.subscribe
        self.client.connect()
        self.client.loop_background()

    def disconnect(self):
        try:
            self.client.disconnect()
            print(f"Đã ngắt kết nối từ {self.AIO_FEED_ID}")
        except Exception as e:
            print(f"Lỗi khi ngắt kết nối từ {self.AIO_FEED_ID}: {e}")

# Tạo instance global
# mqtt_service = MQTTService("bbc-led")


