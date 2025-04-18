#include "backgroundTask.h"

//============================== DOOR CONTROL ==========================
Servo myservo;
int servo_pos = 0; // lưu vị trí của servo
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
      for (servo_pos=0; servo_pos<=180; servo_pos++) { 
         myservo.write(servo_pos);
         delay(15);
      }
      #if SERIAL_PRINT_DATA == 1
         Serial.println("DOOR OPENED");
      #endif
   }
   else{
      // Đảo ngược quá trình từ 180 đến 0 độ
      for (servo_pos=180; servo_pos>=0; servo_pos--) {
      myservo.write(servo_pos);
      delay(15);
      #if SERIAL_PRINT_DATA == 1
         Serial.println("DOOR CLOSED");
      #endif
   }
   }
}

//============================= LED CONTROL ==========================
#if BOARD == YOLOBIT
   Adafruit_NeoPixel NeoPixel(4, led1_PIN , NEO_GRB + NEO_KHZ800);
#endif

// @brief: Setup the LED task
void setupLedTask(){
   #if BOARD == ESP32_DEVKIT_V1
      pinMode(led1_PIN, OUTPUT);
      pinMode(led2_PIN, OUTPUT);
      pinMode(led3_PIN, OUTPUT);
      pinMode(led4_PIN, OUTPUT);
   #else
     NeoPixel.begin();
   #endif   

}

// @brief: Control the LED task
// @param led_state: 1 = on, 0 = off
void LED_Tasks(uint8_t led_state, uint8_t led_num){
   #if BOARD == ESP32_DEVKIT_V1
      if(led_num == 1){
         digitalWrite(led1_PIN, led_state);
      }
      else if(led_num == 2){
         digitalWrite(led2_PIN, led_state);
      }
      else if(led_num == 3){
         digitalWrite(led3_PIN, led_state);
      }
      else if(led_num == 4){
         digitalWrite(led4_PIN, led_state);
      }
      else{
         return;
      }
   #elif BOARD == ESP32_YOLOBIT
      if(led_num == 1){
         NeoPixel.setPixelColor(0, NeoPixel.Color(0, 255, 0));
         NeoPixel.show();
      }
      else if(led_num == 2){
         NeoPixel.setPixelColor(1, NeoPixel.Color(0, 0, 255));
         NeoPixel.show();
      }
      else if(led_num == 3){
         NeoPixel.setPixelColor(3, NeoPixel.Color(255, 0, 0));
         NeoPixel.show();
      }
      else if(led_num == 4){
         NeoPixel.setPixelColor(4, NeoPixel.Color(128, 128,128);
         NeoPixel.show();
      }
      else{
         return;
      }
   #else
      return;
   #endif
}

//============================ FAN CONTROL ==========================

// @brief: Setup the fan task
void setupFanTask(){
   pinMode(FAN_PIN, OUTPUT);
}

// @brief: Control the fan task
// @param fan_speed: 0 = off, 1~100 = speed
void Fan_Tasks(uint8_t fan_speed){
   if(fan_speed == 0){
      digitalWrite(FAN_PIN, LOW); // Turn off the fan
   }
   else{
      analogWrite(FAN_PIN, int(fan_speed*255)/100); // Set the fan speed
   }
}

//============================ DHT SENSOR ==========================

// @brief: Setup the DHT task
void DHT_Task (void* pvParameter){
   #if DHTTYPE == DHT11
   //Setup DHT11 sensor
   DHT dht(DHTPIN, DHTTYPE);
   dht.begin();   

   #elif DHTTYPE == DHT20


   #endif

   //DHT running
   while(1){
      #if DHTTYPE == DHT11
      // DHT11 Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
      global_temp = round(dht.readTemperature()* 10) / 10.0; // Read temperature Celsius and round to 1 decimal place
      global_hum = (uint8_t)dht.readHumidity() ; // Read humidity 
     
      #elif DHTTYPE == DHT20
      // DHT20 Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
      float h = dht.readHumidity();    // Read humidity
      float t = dht.readTemperature(); // Read temperature as Celsius (the default)
      #endif
      

      // Now we can publish stuff!
      #if SERIAL_PRINT_DATA == 0
      hum.publish(global_hum);
      temp.publish(global_temp);

      #else
      Serial.print(F("\nSending Humidity val "));
         if (!hum.publish(global_hum)) {
            Serial.println(F("Failed"));
         } else {
            Serial.println(F("OK!"));
         }
            Serial.print(F("\nSending Temperature val "));
         if (!temp.publish(global_temp)) {
            Serial.println(F("Failed"));
         } else {
            Serial.println(F("OK!"));
         }
         Serial.print(F("Humidity: "));
         Serial.print(global_hum);
         Serial.print(F("% Temperature: "));
         Serial.print(global_temp);
         Serial.print(F("°C "));
   #endif

      vTaskDelay(10000 / portTICK_PERIOD_MS); // Delay of 10 second
   }
}

//============================ LIGHT SENSOR  ==========================

// @brief: Setup the light task
void Light_Task (void* pvParameter){
   //Setup Light sensor
   pinMode(LIGHT_SENSOR_PIN, INPUT); // Set the pin as input

   while(1){
      global_light = (uint8_t)analogRead(LIGHT_SENSOR_PIN); // Read the light sensor value
      light.publish(global_temp);
      #if SERIAL_PRINT_DATA == 1
         Serial.print(F("Light: "));
         Serial.print(global_light);
         Serial.print(F("%\n"));
      #endif
      vTaskDelay(10000 / portTICK_PERIOD_MS); // Delay of 10 second
   }
}

//=========================== BUTTON ==========================

// @brief: Setup the button task
void Button_Task (void* pvParameter){
   pinMode(UP_BUTTON_PIN , INPUT_PULLUP);
   pinMode(DOWN_BUTTON_PIN, INPUT_PULLUP);
   pinMode(SELECT_BUTTON_PIN, INPUT_PULLUP);
   pinMode(CANCEL_BUTTON_PIN, INPUT_PULLUP);
   while(1){
      getKeyInput();
      vTaskDelay(TICK);
   }
}

//=========================== LCD CONTROL ==========================

// @brief: Setup the LCD task
void control_Task (void* pvParameter){
   // Setup LCD
   LiquidCrystal_I2C lcd (0x27,16,2); 
   uint8_t current_row = 0; 
   uint8_t lcd_page = 0;
   uint8_t counter = 0; // Set counter 75cycles = 15seconds / 200ms; When counter = 0, return to main page
   uint8_t wait_time = 75; // 15 seconds

   //Run LCD
   lcd.begin(16, 2);
   lcd.init(); 
   lcd.backlight();lcd.clear(); lcd.setCursor(0, 0);
   lcd.print("WELCOME TO"); lcd.setCursor(0, 1); lcd.print("OUR SMART HOME");
   delay(1000);
   lcd.clear();
   vTaskDelay(1000 / portTICK_PERIOD_MS); // Delay of 1 second
   while(1){
      switch (lcd_page){
      case MAIN_PAGE:
         //PRINT MAIN PAGE (TEMP, HUM, LIGHT)
         // ROW0: T25.0 H100 L100
         // ROW1: DD/MM/YYYY HH:MM
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("T"); lcd.print(global_temp);
         lcd.setCursor(5, 0); lcd.print(" H"); lcd.print(global_hum);
         lcd.setCursor(11, 0); lcd.print(" L"); lcd.print(global_light);
         lcd.setCursor(0, 1); lcd.print(global_day); lcd.print("/"); lcd.print(global_month); lcd.print("/"); lcd.print(global_year);
         lcd.setCursor(11, 1); lcd.print(global_hour); lcd.print(":"); lcd.print(global_minute);
         
         if(isButtonPressed(BUTTON_UP)||isButtonPressed(BUTTON_DOWN)||isButtonPressed(BUTTON_CHANGE)||isButtonPressed(CANCEL)){
            current_row = 0;
            counter = wait_time;
            lcd_page = SETTING_LED12;
            lcd.clear();
         }
         break;

      case SETTING_LED12:   
         //PRINT LED12 PAGE (LED1, LED2)
         // ROW0: LED1: <ON>  <-
         // ROW1: LED2: <OFF> <-
         
         lcd.setCursor(0, 0); lcd.print("LED1: "); lcd.print(global_led1_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(0, 1); lcd.print("LED2: "); lcd.print(global_led2_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(14, current_row); lcd.print("<-");

         if(isButtonPressed(BUTTON_UP)){
            current_row = 0;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_DOWN)){
            current_row = 1;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_OK)){
            if(current_row == 0){
               if(global_led1_state == 1){
                  global_led1_state = 0;
                  LED_Tasks(global_led1_state, 1);
               }
               else{
                  global_led1_state = 1;
                  LED_Tasks(global_led1_state, 1);
               }  
               led1.publish(global_led1_state);
            }
            else{
               if(global_led2_state == 1){
                  global_led2_state = 0;
                  LED_Tasks(global_led2_state, 2);
               }
               else{
                  global_led2_state = 1;
                  LED_Tasks(global_led2_state, 2);
               }  
               led2.publish(global_led2_state);
            }
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            current_row = 0;
            lcd_page = SETTING_LED34;
            lcd.clear();
         }

         if(counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         break;

      case SETTING_LED34:
         //PRINT LED34 PAGE (LED3, LED4)
         // ROW0: LED3: <ON>  <-
         // ROW1: LED4: <OFF> <-
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("LED3: "); lcd.print(global_led3_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(0, 1); lcd.print("LED4: "); lcd.print(global_led4_state == 1 ? "<ON>" : "<OFF>");
         lcd.setCursor(14, current_row); lcd.print("<-");

         if(isButtonPressed(BUTTON_UP)){
            current_row = 0;
            counter = wait_time;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_DOWN)){
            current_row = 1;
            counter = wait_time;
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_OK)){
            counter = wait_time;
            if(current_row == 0){
               if(global_led3_state == 1){
                  global_led3_state = 0;
                  LED_Tasks(global_led3_state, 3);
               }
               else{
                  global_led3_state = 1;
                  LED_Tasks(global_led3_state, 3);
               }  
               led3.publish(global_led3_state);
            }
            else{
               if(global_led4_state == 1){
                  global_led4_state = 0;
                  LED_Tasks(global_led4_state, 4);
               }
               else{
                  global_led4_state = 1;
                  LED_Tasks(global_led4_state, 4);
               } 
               led4.publish(global_led4_state);
            }
            
            lcd.clear();
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            counter = wait_time;
            lcd_page = SETTING_FAN;
            current_row = 0;
            lcd.clear();
         }

         if(counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }
         
         break;

      case SETTING_FAN:
         //PRINT FAN PAGE (FAN)
         // ROW0: FAN SPEED: <100>
         // ROW1: UP=BT1 DOWN=BT2
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("FAN SPEED: "); lcd.print( "<");lcd.print(global_fan_state);lcd.print( ">");
         lcd.setCursor(14, current_row); lcd.print("<-");
         lcd.setCursor(0,1);  lcd.print("UP=BT1 DOWN=BT2");
         if(isButtonPressed(BUTTON_UP)){
            counter = wait_time;
            if(global_fan_state >0)
               global_fan_state += 10;
               if (global_fan_state > 100) global_fan_state = 100;
               Fan_Tasks(global_fan_state);
               fan.publish(global_fan_state);
               lcd.clear();
         }

         if (isButtonPressed(BUTTON_DOWN)){
            counter = wait_time;
            if(global_fan_state > 0)
               global_fan_state -= 10;
               if  (global_fan_state < 0) global_fan_state = 0;
               Fan_Tasks(global_fan_state);
               fan.publish(global_fan_state);
               lcd.clear();
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            counter = wait_time;
            lcd_page = SETTING_DOOR;
            current_row = 0;
            lcd.clear();
         }

         if(counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }
         
         break;
      
      case SETTING_DOOR:
         //PRINT DOOR PAGE (DOOR)
         // ROW0: DOOR: <OPEN>  <-
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print("DOOR: "); lcd.print(global_door_state == 1 ? "<OPEN>" : "<CLOSE>");
         lcd.setCursor(14, current_row); lcd.print("<-");

         if (isButtonPressed(BUTTON_OK)){
            counter = wait_time;
            if(global_door_state == 1){
               global_door_state = 0;
               Door_Tasks(global_door_state);
               
            }
            else{
               global_door_state = 1;
               Door_Tasks(global_door_state);
            }
            door.publish(global_door_state);
         }

         if (isButtonPressed(BUTTON_CHANGE)){
            counter = wait_time;
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         if(counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         break;

      case NOTICE_DOOR:
         //PRINT NOTICE DOOR PAGE
         // ROW0: DOOR IS OPEN
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print(global_door_state == 1 ? "DOOR IS OPEN" : "DOOR IS CLOSE");

         if(counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         break;

      case NOTICE_DETECT:
         //PRINT NOTICE DETECT PAGE
         // ROW0: DETECT IS ON
         lcd.clear();
         lcd.setCursor(0, 0); lcd.print(global_detect_state == 1 ? "HUMAN DETECTED" : "HUMAN NOT DETECTED");

         if(counter == 0){
            lcd_page = MAIN_PAGE;
            current_row = 0;
            lcd.clear();
         }

         break;
   }
      if (counter> 0) counter--;
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
   xTaskCreate( control_Task, "LCD_Task", 3096, NULL, 10, NULL);
}