#include "backgroundTask.h"


//============================== DOOR CONTROL ==========================
Servo myservo;
//@brief: Setup the door task      
void setupDoorTask(){
   myservo.attach(door_PIN); // kết nối servo với chân door_PIN
   myservo.write(0); // Đặt vị trí ban đầu của servo là 0 độ
}

//@brief: Control the door task
// @param door_state: 1 = open, 0 = close
void Door_Tasks (uint8_t door_state){
   if(door_state == 1){
      // từ 0 đến 180 độ
         myservo.write(90);
      #if SERIAL_PRINT_DATA == 1
         Serial.println("DOOR OPENED");
      #endif
   }
   else{
      myservo.write(0);
      #if SERIAL_PRINT_DATA == 1
         Serial.println("DOOR CLOSED");
      #endif
   }

   lcd_page = NOTICE_DOOR;
   lcd_counter = 25;
   lcd.clear();
}


//============================= LED CONTROL ==========================

   Adafruit_NeoPixel NeoPixel(4, led1_PIN , NEO_GRB + NEO_KHZ800);

// @brief: Setup the LED task
void setupLedTask(){
     NeoPixel.begin();
}

// @brief: Control the LED task
// @param led_state: 1 = on, 0 = off
void LED_Tasks(uint8_t led_state, uint8_t led_num){
      if(led_num == 0){
         if (led_state == 1)NeoPixel.setPixelColor(0, NeoPixel.Color(0, 255, 0));
         else NeoPixel.setPixelColor(0, NeoPixel.Color(0, 0, 0));
         NeoPixel.show();
      }
      else if(led_num == 1){
         if (led_state == 1)NeoPixel.setPixelColor(1, NeoPixel.Color(0, 0, 255));
         else NeoPixel.setPixelColor(1, NeoPixel.Color(0, 0, 0));
         NeoPixel.show();
      }
      else if(led_num == 2){
         if (led_state == 1)NeoPixel.setPixelColor(2, NeoPixel.Color(255, 0, 0));
         else NeoPixel.setPixelColor(2, NeoPixel.Color(0, 0, 0));
         NeoPixel.show();
      }
      else if(led_num == 3){
         if (led_state == 1)NeoPixel.setPixelColor(3, NeoPixel.Color(128, 128,128));
         else NeoPixel.setPixelColor(3, NeoPixel.Color(0, 0, 0));
         NeoPixel.show();
      }
      else{
         return;
      }
}

//============================ FAN CONTROL ==========================

// @brief: Setup the fan task
void setupFanTask(){
   pinMode(FAN_PIN, OUTPUT);
}

// @brief: Control the fan task
// @param fan_speed: 0 = off, 1~100 = speed
void Fan_Tasks(uint8_t fan_speed){
      analogWrite(FAN_PIN, int(fan_speed*255)/100); // Set the fan speed
}

//============================ DHT SENSOR ==========================

// @brief: Setup the DHT task
void DHT_Task (void* pvParameter){
   // Setup DHT sensor 20
   
   DHT20 dht (&Wire);
   dht.begin(); // DHT20 I2C address is 0x5C

   //DHT running
   while(1){
      // DHT20 Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
      dht.read();
      global_temp = round(dht.getTemperature()* 10) / 10.0; // Read temperature Celsius and round to 1 decimal place
      global_hum = (uint8_t)dht.getHumidity() ; // Read humidity 
     
      // Now we can publish stuff!
      #if SERIAL_PRINT_DATA == 0
      hum.publish(global_hum);
      temp.publish(global_temp);

      #else
         if (!hum.publish(global_hum)) Serial.println(F("Sending Humidity val Failed\n"));
         if (!temp.publish(global_temp)) Serial.println(F("Sending Temperature val Failed\n"));
         Serial.print(F("Humidity: "));
         Serial.print(global_hum);
         Serial.print(F("% Temperature: "));
         Serial.print(global_temp);
         Serial.print(F("°C "));
   #endif

      vTaskDelay(30000 / portTICK_PERIOD_MS); // Delay of 30 second
   }
}

//============================ LIGHT SENSOR  ==========================

// @brief: Setup the light task
void Light_Task (void* pvParameter){
   //Setup Light sensor
   pinMode(LIGHT_SENSOR_PIN, INPUT); // Set the pin as input

   while(1){
      global_light = (analogRead(LIGHT_SENSOR_PIN)*100)/4095; // Read the light sensor value
      light.publish( global_light);
      #if SERIAL_PRINT_DATA == 1
         Serial.print(F("Light: "));
         Serial.print(global_light);
         Serial.print(F("%\n"));
      #endif
      vTaskDelay(20000 / portTICK_PERIOD_MS); // Delay of 20 second
   }
}

//=========================== BUTTON ==========================

// @brief: Setup the button task
void Button_Task (void* pvParameter){
   pinMode(UP_BUTTON_PIN, INPUT_PULLUP);
   pinMode(DOWN_BUTTON_PIN, INPUT_PULLUP);
   pinMode(CHANGE_BUTTON_PIN, INPUT_PULLUP);
   pinMode(OK_BUTTON_PIN, INPUT_PULLUP);
   while(1){
      getKeyInput();
      vTaskDelay(TICK);
   }
}


//=========================== CLOCK_TASK ==========================

int days_in_month(int month, int year) {
    switch(month) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            return 31;
        case 4: case 6: case 9: case 11:
            return 30;
        case 2:
            // Năm nhuận nếu chia hết cho 4 và (không chia hết cho 100 hoặc chia hết cho 400)
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0))
                return 29;
            else
                return 28;
        default:
            return 30; // fallback an toàn
    }
}

void clock_task(void *pvParameters) {
    while(1) {
         global_second++;
         if (global_second >= 60) {
               global_second = 0;
               global_minute++;
               if (global_minute >= 60) {
                  global_minute = 0;
                  global_hour++;
                  if (global_hour >= 24) {
                     global_hour = 0;
                     global_day++;
                     if (global_day > days_in_month(global_month, global_year)) {
                           global_day = 1;
                           global_month++;
                           if (global_month > 12) {
                              global_month = 1;
                              global_year++;
                           }
                     }
                  }
               }
         }
         vTaskDelay(1000 / portTICK_PERIOD_MS); // Delay of 1 second
    }
}

//=========================== LCD CONTROL ==========================

LiquidCrystal_I2C lcd (0x21,16,2); 
uint8_t lcd_page = MAIN_PAGE;
uint8_t lcd_counter = 0; // Set lcd_counter 75cycles = 15seconds / 200ms; When lcd_counter = 0, return to main page

// @brief: Setup the LCD task
void control_Task (void* pvParameter){
   // Setup LCD
  
   //LiquidCrystal_I2C lcd (0x21,16,2); 

   uint8_t current_row = 0; 

   uint8_t wait_time = 75; // 15 seconds
   uint8_t dot = 0;

   //Run LCD
   lcd.init(); 
   lcd.backlight();lcd.clear(); lcd.setCursor(0, 0);
   lcd.print("WELCOME TO"); lcd.setCursor(0, 1); lcd.print("OUR SMART HOME");
   delay(5000);
   lcd.clear();
   while(1){
      switch (lcd_page){
      case MAIN_PAGE:{
         //PRINT MAIN PAGE (TEMP, HUM, LIGHT)
         // ROW0: T25.0 H100 L100
         // ROW1: DD/MM/YYYY HH:MM
         lcd.setCursor(0, 0); lcd.print("T:"); lcd.print(global_temp);
         lcd.setCursor(6, 0); lcd.print(" H:"); lcd.print(global_hum);
         lcd.setCursor(11, 0); lcd.print(" L:"); lcd.print(global_light);
         lcd.setCursor(0, 1); lcd.print(global_day); lcd.print("/"); lcd.print(global_month); lcd.print("/"); lcd.print(global_year);
         lcd.setCursor(11, 1); global_hour < 10 ? (lcd.print("0"), lcd.print(global_hour)) : lcd.print(global_hour);
         lcd.print(dot == 1 ? ":" : " "); 
         global_minute < 10 ? (lcd.print("0"), lcd.print(global_minute)) : lcd.print(global_minute);

         if(lcd_counter == 0){lcd_counter = 5; dot = !dot;}
         
         if(isButtonPressed(BUTTON_UP)||isButtonPressed(BUTTON_DOWN)||isButtonPressed(BUTTON_OK)||isButtonPressed(BUTTON_CHANGE)){
            current_row = 0;
            lcd_counter = wait_time;
            lcd_page = SETTING_LED12;
            lcd.clear();
         }
         break;
      }
      case SETTING_LED12:{
         //PRINT LED12 PAGE (LED1, LED2)
         // ROW0: LED1: <ON>  <-
         // ROW1: LED2: <OFF> <-
         
         lcd.setCursor(0, 0); lcd.print("LED1: "); lcd.print(global_led1_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(0, 1); lcd.print("LED2: "); lcd.print(global_led2_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(14, current_row); lcd.print("<-");

         if(isButtonPressed(BUTTON_UP)){
            current_row = 0;
            lcd_counter = wait_time;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_DOWN)){
            current_row = 1;
            lcd_counter = wait_time;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_OK)){
            if(current_row == 0){
               if(global_led1_state == 1){
                  global_led1_state = 0;
                  LED_Tasks(global_led1_state, 0);
               }
               else{
                  global_led1_state = 1;
                  LED_Tasks(global_led1_state, 0);
               }  
               led1.publish(global_led1_state);
            }
            else{
               if(global_led2_state == 1){
                  global_led2_state = 0;
                  LED_Tasks(global_led2_state, 1);
               }
               else{
                  global_led2_state = 1;
                  LED_Tasks(global_led2_state, 1);
               }  
               led2.publish(global_led2_state);
            }
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            current_row = 0;
            lcd_counter = wait_time;
            lcd_page = SETTING_LED34;
            lcd.clear();
         }

         if(lcd_counter == 0){
            lcd_page = MAIN_PAGE;
            lcd_counter = wait_time;
            current_row = 0;
            lcd.clear();
         }

         break;
      }
      case SETTING_LED34:{
         //PRINT LED34 PAGE (LED3, LED4)
         // ROW0: LED3: <ON>  <-
         // ROW1: LED4: <OFF> <-
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("LED3: "); lcd.print(global_led3_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(0, 1); lcd.print("LED4: "); lcd.print(global_led4_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(14, current_row); lcd.print("<-");

         if(isButtonPressed(BUTTON_UP)){
            current_row = 0;
            lcd_counter = wait_time;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_DOWN)){
            current_row = 1;
            lcd_counter = wait_time;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_OK)){
            lcd_counter = wait_time;
            if(current_row == 0){
               if(global_led3_state == 1){
                  global_led3_state = 0;
                  LED_Tasks(global_led3_state, 2);
               }
               else{
                  global_led3_state = 1;
                  LED_Tasks(global_led3_state, 2);
               }  
               led3.publish(global_led3_state);
            }
            else{
               if(global_led4_state == 1){
                  global_led4_state = 0;
                  LED_Tasks(global_led4_state, 3);
               }
               else{
                  global_led4_state = 1;
                  LED_Tasks(global_led4_state, 3);
               } 
               led4.publish(global_led4_state);
            }
            
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            lcd_counter = wait_time;
            lcd_page = SETTING_FAN;
            current_row = 0;
            lcd.clear();
         }

         if(lcd_counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }
         
         break;
      }
      case SETTING_FAN:{
         //PRINT FAN PAGE (FAN)
         // ROW0: FAN SPEED: <100>
         // ROW1: UP=BT1 DOWN=BT2
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("FAN SPEED: "); lcd.print( "<");lcd.print(global_fan_state);lcd.print( ">");
         lcd.setCursor(14, current_row);
         lcd.setCursor(0,1);  lcd.print("UP=BT1 DOWN=BT2");
         if(isButtonPressed(BUTTON_UP)){
            lcd_counter = wait_time;
            if(global_fan_state < 100)
               global_fan_state += 20;
               if (global_fan_state > 100) global_fan_state = 100;
               Fan_Tasks(global_fan_state);
               fan.publish(global_fan_state);
               lcd.clear();
         }

         if (isButtonPressed(BUTTON_DOWN)){
            lcd_counter = wait_time;
            if(global_fan_state > 0 )
               global_fan_state -= 20;
               if  (global_fan_state < 0) global_fan_state = 0;
               Fan_Tasks(global_fan_state);
               fan.publish(global_fan_state);
               lcd.clear();
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            lcd_counter = wait_time;
            lcd_page = SETTING_DOOR;
            current_row = 0;
            lcd.clear();
         }

         if(lcd_counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }
         
         break;
      }
      case SETTING_DOOR:{
         //PRINT DOOR PAGE (DOOR)
         // ROW0: DOOR: <OPEN>  <-
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("DOOR: "); lcd.print(global_door_state == 1 ? "<OPEN>" : "<CLOSE>");
         lcd.setCursor(14, current_row); lcd.print("<-");

         if (isButtonPressed(BUTTON_OK)){
            if(global_door_state == 1){
               global_door_state = 0;
               Door_Tasks(global_door_state);
               
            }
            else{
               global_door_state = 1;
               Door_Tasks(global_door_state);
            }
            lcd_page = SETTING_DOOR;
            lcd_counter = wait_time;
            door.publish(global_door_state);
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            lcd_counter = wait_time;
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         if(lcd_counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         break;
      }
      case NOTICE_DOOR:{
         //PRINT NOTICE DOOR PAGE
         // ROW0: DOOR IS OPEN
         lcd.setCursor(0, 1); lcd.print(global_door_state == 1 ? "DOOR IS OPENED" : "DOOR IS CLOSED");
         if(lcd_counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }
         break;
      }
      case NOTICE_DETECT:{
         //PRINT NOTICE DETECT PAGE
         // ROW0: DETECT IS ON
         lcd.setCursor(0, 0); lcd.print(global_detect_state == 1 ? "HUMAN DETECTED" : "HUMAN NOT DETECTED");
         if(lcd_counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         break;
      }
   }
      if (lcd_counter> 0) lcd_counter--;
      vTaskDelay(200 / portTICK_PERIOD_MS); // Delay of 250 ms
   }
}



//=========================== SETUP BACKGROUND TASK ==========================

// @brief: Setup the background task
void setupBackgroundTask(){
   setupDoorTask();
   setupLedTask();
   setupFanTask();
   xTaskCreate( DHT_Task, "DHT_Task", 3096, NULL, 10, NULL);
   xTaskCreate( Light_Task, "Light_Task", 3096, NULL, 10, NULL);
   xTaskCreate( Button_Task, "Button_Task", 3096, NULL, 10, NULL);
   xTaskCreate( control_Task, "control_Task", 3096, NULL, 10, NULL);
   xTaskCreate( clock_task, "clock_task", 3096, NULL, 10, NULL);
}