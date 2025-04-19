#ifndef button_h
#define button_h

#include "Arduino.h"
#include "systemConfig.h"
//#include "IRremote.hpp"

#define NORMAL_STATE SET
#define PRESSED_STATE RESET

extern int button_flag[5];

#define TICK 20 // 20ms
#define SET 1
#define RESET 0

#define MAX_BUTTON 4

//SET UP BUTTON PIN
#define BUTTON0_PIN UP_BUTTON_PIN 
#define BUTTON1_PIN DOWN_BUTTON_PIN
#define BUTTON2_PIN OK_BUTTON_PIN
#define BUTTON3_PIN CHANGE_BUTTON_PIN

int isButtonPressed(int button_index);
int isButtonLongPressed(int button_index);
void getKeyInput();

#endif /* INC_BUTTON_H_ */