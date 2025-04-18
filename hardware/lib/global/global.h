#ifndef GLOBAL_H
#define GLOBAL_H

#include <Arduino.h>
#include <Adafruit_MQTT.h>
#include <Adafruit_MQTT_Client.h>
#include <LiquidCrystal_I2C.h>
#include <Wifi.h>
#include "systemConfig.h"
#include "button.h"
#include "ESP32Servo.h"
#include "Adafruit_NeoPixel.h"
#include "DHT20.h"
#include "time.h"

#define BUTTON_UP 0
#define BUTTON_DOWN 1
#define BUTTON_OK 2
#define BUTTON_CHANGE 3

//System Sharing MQTT Client
extern Adafruit_MQTT_Publish temp;
extern Adafruit_MQTT_Publish hum;   
extern Adafruit_MQTT_Publish light;
extern Adafruit_MQTT_Publish led1;
extern Adafruit_MQTT_Publish led2;
extern Adafruit_MQTT_Publish led3;
extern Adafruit_MQTT_Publish led4;
extern Adafruit_MQTT_Publish door;
extern Adafruit_MQTT_Publish fan;

//System Sharing MQTT Subscribe
extern Adafruit_MQTT_Subscribe onoffled1;
extern Adafruit_MQTT_Subscribe onoffled2;
extern Adafruit_MQTT_Subscribe onoffled3;
extern Adafruit_MQTT_Subscribe onoffled4;
extern Adafruit_MQTT_Subscribe onoffdoor;
extern Adafruit_MQTT_Subscribe controll_fan;

//System Sharing Sensor Data and Device State
extern float global_temp;
extern uint8_t global_hum;
extern uint8_t global_light;
extern uint8_t global_door_state;
extern uint8_t global_detect_state;
extern uint8_t global_fan_state;
extern uint8_t global_led1_state;
extern uint8_t global_led2_state;
extern uint8_t global_led3_state;
extern uint8_t global_led4_state;

extern uint16_t global_year;
extern uint8_t global_month;
extern uint8_t global_day;
extern uint8_t global_hour;
extern uint8_t global_minute;
extern uint8_t global_second;

#endif