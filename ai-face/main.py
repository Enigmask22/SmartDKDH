# from codecs import ignore_errors

# import random
# import time
# import sys
# from Adafruit_IO import MQTTClient
# from simple_ai import *

# AIO_FEED_ID = ["dadn-door", "dadn-ai"]
# AIO_USERNAME = "BachbeastCE"
# AIO_KEY = "aio_XgRq89UmF45Re6LPnROs6Rc9gXF7"
# def connected (client):
#     print (" Ket noi thanh cong ...")
#     for feed in AIO_FEED_ID:
#         client.subscribe(feed)

# def subscribe ( client , userdata , mid , granted_qos ):
#     print (" Subcribe thanh cong ... ")

# def disconnected ( client ):
#     print (" Ngat ket noi ... ")
#     sys.exit (1)

# detect_state = 0
# door_state = 0

# def message(client, feed_id, payload):
#     global door_state, detect_state
#     print("Nhan du lieu: " + str(payload) + " tu feed " + str(feed_id))
#     if feed_id == "dadn-door":
#         if int(payload) == 1: 
#             door_state = 1
#         else: 
#             door_state = 0

# # MQTT INITIAL
# client = MQTTClient ( AIO_USERNAME , AIO_KEY )
# client . on_connect = connected
# client . on_disconnect = disconnected
# client . on_message = message
# client . on_subscribe = subscribe
# client . connect ()
# client . loop_background ()




# while True :
#     time.sleep(0.1)
#     print("Door state: ", door_state)
#     print("Detect state: ", detect_state)
#     camera = cv2.VideoCapture(0)
#     while True:
#         ret, image = camera.read()
#         # Resize the raw image into (224-height,224-width) pixels
#         image = cv2.resize(image, (224, 224), interpolation=cv2.INTER_AREA)
    
#         # Show the image in a window
#         cv2.imshow("Webcam Image", image)
#         print("AI is running1")
#         prediction = image_detector(image)
#         index = np.argmax(prediction)
#         class_name = class_names[index]
#         confidence_score = prediction[0][index]
#         # Print prediction and confidence score
#         print("Class:", class_name[2:], end="")
#         print("Confidence Score:", str(np.round(confidence_score * 100))[:-2], "%")
#         if index == 2:
#             client.publish("dadn-door", "0")
#             client.publish("dadn-ai", "Có người lạ tiếp cận")       
#         else:
#             door_state = 1
#             client.publish("dadn-door", "1")
#             client.publish("dadn-ai", "Welcome Home")

#             break
#         time.sleep(1)
    
#     time.sleep(10)
#     # Release the camera and close the window.

#     camera.release()
#     cv2.destroyAllWindows()



import sys
import time
import cv2
from Adafruit_IO import MQTTClient
from simple_ai import image_detector, get_prediction_label

AIO_FEED_ID = ["dadn-door", "dadn-ai"]
AIO_USERNAME = "BachbeastCE"
AIO_KEY = "aio_XgRq89UmF45Re6LPnROs6Rc9gXF7"

door_state = 0

# ----------- MQTT CALLBACKS -----------
def connected(client):
    print("✅ Kết nối MQTT thành công.")
    for feed in AIO_FEED_ID:
        client.subscribe(feed)

def subscribe(client, userdata, mid, granted_qos):
    print("📡 Subscribed thành công.")

def disconnected(client):
    print("❌ Mất kết nối MQTT.")
    sys.exit(1)

def message(client, feed_id, payload):
    global door_state
    print(f"📩 Nhận dữ liệu: {payload} từ feed {feed_id}")
    if feed_id == "dadn-door":
        door_state = int(payload)

# ----------- MQTT INIT -----------
client = MQTTClient(AIO_USERNAME, AIO_KEY)
client.on_connect = connected
client.on_disconnect = disconnected
client.on_message = message
client.on_subscribe = subscribe
client.connect()
client.loop_background()

# ----------- CAMERA + AI LOOP -----------
camera = cv2.VideoCapture(0)
if not camera.isOpened():
    print("❌ Không thể mở webcam.")
    sys.exit(1)

try:
    while True:
        ret, image = camera.read()
        if not ret:
            continue

        cv2.imshow("AI Door Camera", image)
        prediction = image_detector(image)
        class_name, confidence = get_prediction_label(prediction)

        #print(f"🧠 AI Dự đoán: {class_name} ({confidence*100:.2f}%)")

        if "Stranger" in class_name:
            if door_state != 0:
                client.publish("dadn-door", "0")
                client.publish("dadn-ai", "Có người lạ tiếp cận")
                door_state = 0
        else:
            if door_state != 1:
                client.publish("dadn-door", "1")
                client.publish("dadn-ai", "Welcome Home")
                door_state = 1

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break



except KeyboardInterrupt:
    print("🛑 Đã dừng chương trình.")

finally:
    camera.release()
    cv2.destroyAllWindows()

        

        



    
    




 