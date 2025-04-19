#ifndef SYSTEMCONFIG_H
#define SYSTEMCONFIG_H

/************************* Setting *********************************/

#define SERIAL_PRINT_DATA 1

/************************* PIN Setup *********************************/
#define LIGHT_SENSOR_PIN 33
#define led1_PIN 32    
#define FAN_PIN 27
#define door_PIN 15
#define UP_BUTTON_PIN 18
#define DOWN_BUTTON_PIN 19
#define OK_BUTTON_PIN 23
#define CHANGE_BUTTON_PIN 5

/************************* WiFi Access Point *********************************/

#define WLAN_SSID       "your_ssid"   // Replace with your Wi-Fi SSID
#define WLAN_PASS       "your_pass"   // Replace with your Wi-Fi Password

/************************* Adafruit.io Setup *********************************/

#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883                                 // use 8883 for SSL
#define AIO_USERNAME    "your_username"    // Replace with your Adafruit IO Username
#define AIO_KEY         "your_key"   // Replace with your Adafruit IO Key

/************************* ETC... Setup *********************************/

#define DHTTYPE  DHT20  // Type of DHT Sensor, DHT11 or DHT22

#endif