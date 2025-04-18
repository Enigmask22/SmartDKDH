#

# from keras.models import load_model  # TensorFlow is required for Keras to work
# import cv2  # Install opencv-python
# import time
# import numpy as np

# # Disable scientific notation for clarity
# np.set_printoptions(suppress=True)

# # Load the model
# model = load_model("keras_Model.h5", compile=False)

# # Load the labels
# class_names = open("labels.txt", "r").readlines()

# # CAMERA can be 0 or 1 based on default camera of your computer

    
# def image_detector(image):
#     # Grab the webcamera's image.
   
#     # Make the image a numpy array and reshape it to the models input shape.
#     image = np.asarray(image, dtype=np.float32).reshape(1, 224, 224, 3)

#     # Normalize the image array
#     image = (image / 127.5) - 1

#     # Predicts the model
#     prediction = model.predict(image)
#     return prediction

   
  
#     # Listen to the keyboard for presses.
#     #keyboard_input = cv2.waitKey(1)

#     # 27 is the ASCII for the esc key on your keyboard.
#     #if keyboard_input == 27:


from keras.models import load_model
import numpy as np
import cv2
import os

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load model and labels
model_path = "keras_Model.h5"
labels_path = "labels.txt"

if not os.path.exists(model_path):
    raise FileNotFoundError("❌ Không tìm thấy file keras_Model.h5")
if not os.path.exists(labels_path):
    raise FileNotFoundError("❌ Không tìm thấy file labels.txt")

model = load_model(model_path, compile=False)
class_names = [line.strip() for line in open(labels_path, "r").readlines()]

def image_detector(image):
    """Nhận ảnh, chuẩn hóa và đưa vào model dự đoán."""
    image = cv2.resize(image, (224, 224))
    image = np.asarray(image, dtype=np.float32).reshape(1, 224, 224, 3)
    image = (image / 127.5) - 1
    prediction = model.predict(image)
    return prediction

def get_prediction_label(prediction):
    """Trả về nhãn và độ tự tin từ dự đoán"""
    index = np.argmax(prediction)
    class_name = class_names[index]
    confidence_score = prediction[0][index]
    return class_name, confidence_score



