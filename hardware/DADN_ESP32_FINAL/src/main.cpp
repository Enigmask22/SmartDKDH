#include <Arduino.h>
#include "global.h"
#include "backgroundTask.h"

/************ Global State (you don't need to change this!) ******************/

// Create an ESP8266 WiFiClient class to connect to the MQTT server.
WiFiClient client;
// or... use WiFiClientSecure for SSL
//WiFiClientSecure client;

// Setup the MQTT client class by passing in the WiFi client and MQTT server and login details.
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

/****************************** Feeds ***************************************/

// Setup feeds called 'temp' & 'hum' for publishing.
// Notice MQTT paths for AIO follow the form: <username>/feeds/<feedname>
// feedname should be the same as set in dashboard for temp and hum gauges
Adafruit_MQTT_Publish temp = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_Temp");  // Puslish temperature feed
Adafruit_MQTT_Publish hum = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_Humi"); // Publish humidity feed
Adafruit_MQTT_Publish light = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_Light");  // Puslish temperature feed
Adafruit_MQTT_Publish led1 = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_LED_1");  // Puslish led1 feed
Adafruit_MQTT_Publish led2 = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_LED_2");  // Puslish led2 feed
Adafruit_MQTT_Publish led3 = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_LED_3");  // Puslish led3 feed
Adafruit_MQTT_Publish led4 = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_LED_4");  // Puslish led4 feed
Adafruit_MQTT_Publish door = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/DADN_Door");  // Puslish door feed
Adafruit_MQTT_Publish fan = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/dadn-fan-1");  // Puslish fan feed

// Setup a feed called 'onoff' for controlling LED.
Adafruit_MQTT_Subscribe onoffled1 = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/DADN_LED_1");
Adafruit_MQTT_Subscribe onoffled2 = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/DADN_LED_2");
Adafruit_MQTT_Subscribe onoffled3 = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/DADN_LED_3");
Adafruit_MQTT_Subscribe onoffled4 = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/DADN_LED_4");
Adafruit_MQTT_Subscribe onoffdoor = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/DADN_Door");
Adafruit_MQTT_Subscribe controll_fan = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/DADN_Fan");

void MQTT_connect();
                                                                                                    
void setup() {
  Serial.begin(115200);
  delay(10);
  pinMode(led1_PIN, OUTPUT);
  pinMode(led2_PIN, OUTPUT);
  //pinMode(ledPin3, OUTPUT);
  //pinMode(ledPin4, OUTPUT);
  pinMode(door_PIN, OUTPUT);

  Serial.println(F("Adafruit MQTT demo"));

  // Connect to WiFi access point.
  Serial.println(); Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WLAN_SSID);

  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  Serial.println("WiFi connected");
  Serial.println("IP address: "); Serial.println(WiFi.localIP());

  // Setup MQTT subscription for onoff feed.
  mqtt.subscribe(&onoffled1);
  mqtt.subscribe(&onoffled2);
  mqtt.subscribe(&onoffled3);
  mqtt.subscribe(&onoffled4);
  mqtt.subscribe(&onoffdoor);
  mqtt.subscribe(&controll_fan);

  setupBackgroundTask();  
}

void loop() {
  // Ensure the connection to the MQTT server is alive (this will make the first
  // connection and automatically reconnect when disconnected).  See the MQTT_connect
  // function definition further below.
  MQTT_connect();
  // this is our 'wait for incoming subscription packets' busy subloop
  // try to spend your time here
  Adafruit_MQTT_Subscribe *subscription;
  // Wait 2000 milliseconds, while we wait for data from subscription feed. After this wait, next code will be executed
  while ((subscription = mqtt.readSubscription(2000))) {
    if (subscription == &onoffled1) {
      #if SERIAL_PRINT_DATA == 0
        char *value = (char *)onoffled1.lastread;
      #else
        Serial.print(F("Got: "));
        char *value = (char *)onoffled1.lastread;
        Serial.println((char *)onoffled1.lastread);
        Serial.print(F("Received: ")); // Display the value received from dashboard
        Serial.println(value);
      #endif

      // Apply message to OnOff
      String message = String(value);
      Serial.println(message);
      message.trim();
      if (message == "1") {
        LED_Tasks(1,1);
        Serial.println("LED 1 ON");
      }
      if (message == "0") {
        LED_Tasks(0,1);
        Serial.println("LED 1 OFF");
      }
    }

    if (subscription == &onoffled2) {
    #if SERIAL_PRINT_DATA == 0
      char *value = (char *)onoffled2.lastread;
    #else
      Serial.print(F("Got: "));
      char *value = (char *)onoffled2.lastread;
      Serial.println((char *)onoffled2.lastread);
      Serial.print(F("Received: ")); // Display the value received from dashboard
      Serial.println(value);
    #endif

    // Apply message to OnOff
    String message = String(value);
    Serial.println(message);
    message.trim();
    if (message == "1") {
      LED_Tasks(1,2);
      Serial.println("LED 1 ON");
    }
    if (message == "0") {
      LED_Tasks(0,2);
      Serial.println("LED 1 OFF");
    }
  }

    if (subscription == &onoffled3) {
    #if SERIAL_PRINT_DATA == 0
      char *value = (char *)onoffled3.lastread;
    #else
      Serial.print(F("Got: "));
      char *value = (char *)onoffled3.lastread;
      Serial.println((char *)onoffled3.lastread);
      Serial.print(F("Received: ")); // Display the value received from dashboard
      Serial.println(value);
    #endif

    // Apply message to OnOff
    String message = String(value);
    Serial.println(message);
    message.trim();
    if (message == "1") {
      LED_Tasks(1,1);
      Serial.println("LED 3 ON");
    }
    if (message == "0") {
      LED_Tasks(0,1);
      Serial.println("LED 3 OFF");
    }
  }
  
    if (subscription == &onoffled4) {
      #if SERIAL_PRINT_DATA == 0
        char *value = (char *)onoffled4.lastread;
      #else
        Serial.print(F("Got: "));
        char *value = (char *)onoffled4.lastread;
        Serial.println((char *)onoffled4.lastread);
        Serial.print(F("Received: ")); // Display the value received from dashboard
        Serial.println(value);
      #endif

      // Apply message to OnOff
      String message = String(value);
      Serial.println(message);
      message.trim();
      if (message == "1") {
        LED_Tasks(1,4);
        Serial.println("LED 4 ON");
      }
      if (message == "0") {
        LED_Tasks(0,4);
        Serial.println("LED 4 OFF");
      }
    }

    if (subscription == &onoffdoor) {
      #if SERIAL_PRINT_DATA == 0
        char *value = (char *)onoffdoor.lastread;
      #else
        Serial.print(F("Got: "));
        char *value = (char *)onoffdoor.lastread;
        Serial.println((char *)onoffdoor.lastread);
        Serial.print(F("Received: ")); // Display the value received from dashboard
        Serial.println(value);
      #endif

      // Apply message to OnOff
      String message = String(value);
      Serial.println(message);
      message.trim();
      if(message == String(global_door_state)){
        return;
      }
      else{
        if (message == "1") {
          Door_Tasks(1);
          Serial.println("DOOR OPENED");
        }
        else if (message == "0") {
          Door_Tasks(0);
          Serial.println("DOOR CLOSED");
        }
        else{
          Serial.println("DOOR ERROR");
        }
      }
    }

    if (subscription == &controll_fan) {
    #if SERIAL_PRINT_DATA == 0
      char *value = (char *)controll_fan.lastread;
    #else
      Serial.print(F("Got: "));
      char *value = (char *)controll_fan.lastread;
      Serial.println((char *)controll_fan.lastread);
      Serial.print(F("Received: ")); // Display the value received from dashboard
      Serial.println(value);
    #endif

    String message = String(value);
    Serial.println(message);
    message.trim();
    global_fan_state = message.toInt();
    if (global_fan_state > 0) {
      Fan_Tasks(global_fan_state);
      Serial.println("Fan speed: " + String(global_fan_state));
    }
    else {
      Fan_Tasks(0);
      Serial.println("Fan OFF");
    }
  }

  }
  // Check if 20 seconds have passed since the last sensor read

  // ping the server to keep the mqtt connection alive
  // NOT required if you are publishing once every KEEPALIVE seconds
  /*
    if(! mqtt.ping()) {
    mqtt.disconnect();
    }
  */
}

// Function to connect and reconnect as necessary to the MQTT server.
// Should be called in the loop function and it will take care if connecting.
void MQTT_connect() {
  int8_t ret;

  // Stop if already connected.
  if (mqtt.connected()) {
    return;
  }

  Serial.print("Connecting to MQTT... ");

  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) { // connect will return 0 for connected
    Serial.println(mqtt.connectErrorString(ret));
    Serial.println("Retrying MQTT connection in 5 seconds...");
    mqtt.disconnect();
    delay(5000);  // wait 5 seconds
    retries--;
    if (retries == 0) {
      // basically die and wait for WDT to reset me
      while (1);
    }
  }
  Serial.println("MQTT Connected!");
}



