#ifndef button_h
#define button_h

#include "Arduino.h"
#include "systemConfig.h"

#define NORMAL_STATE SET
#define PRESSED_STATE RESET

extern int button_flag[5];

#define TICK 20 // 20ms
#define SET 1
#define RESET 0

#define MAX_BUTTON 4
#define BUTTON0 0
#define BUTTON1 1 
#define BUTTON2 2
#define BUTTON3 3

int isButtonPressed(int button_index);
int isButtonLongPressed(int button_index);
void getKeyInput();

#endif /* INC_BUTTON_H_ */