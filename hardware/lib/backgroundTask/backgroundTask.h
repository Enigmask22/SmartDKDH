#ifndef backgroundTask_H
#define backgroundTask_H

#include <global.h>

#define INIT 0

#define MAIN_PAGE 10

#define SETTING_LED12 20
#define SETTING_LED34 21
#define SETTING_FAN 22
#define SETTING_DOOR 23

#define NOTICE_DOOR 30
#define NOTICE_DETECT 31

extern Servo myservo;
extern LiquidCrystal_I2C lcd;
extern uint8_t lcd_page;
extern uint8_t lcd_counter;

void setupBackgroundTask();
void Door_Tasks (uint8_t door_state);
void LED_Tasks(uint8_t led_state, uint8_t led_num);
void Fan_Tasks(uint8_t fan_speed);

#endif