
#include <SoftwareSerial.h>
#define TIMEOUT 5000 // mS

const int MOISTURE_SENSOR = A7;
const char* SERIAL_NUMBER = "d34db33f";

SoftwareSerial ESP8266(7, 6); // RX, TX

void setup()
{ 
  delay(500);
  Serial.begin(4800);
  ESP8266.begin(4800);
  Serial.println("Booting Arduino");
}
 
int ctr = 0;
void loop(){

  if(++ctr % 20 == 0) {
    Serial.println("Updating sensor data...");
    ctr = 0;
    char buf[64];
    sprintf(buf, "1%s moisture %s", SERIAL_NUMBER, String((float)analogRead(MOISTURE_SENSOR)/1024.f,2).c_str());
    ESP8266.println(buf);
  }

  
  String msg="";
  boolean available = false;
  while (ESP8266.available()){
    msg+=ESP8266.readString();
    available= true;
  }
 
  if (available) {
    while(msg.length() > 0) {
      char controlCode = msg.charAt(0);
      String data = msg.substring(1,msg.indexOf('\n'));
      msg = msg.substring(msg.indexOf('\n')+1);
      if(controlCode == '0')
        Serial.println("[ESP8266 DEBUG]: "+data);
    }
  }
  delay(100);
 }
