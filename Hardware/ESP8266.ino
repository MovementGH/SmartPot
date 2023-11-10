#include "ESP8266WiFi.h"
#include "WiFiUdp.h"

const char* ssid = "NETGEAR95"; //Enter SSID
const char* password = "unevenjade770"; //Enter Password
const char* serverIP = "138.88.233.57";
const int serverPort = 8124;

WiFiUDP udp;
unsigned int localPort = 8888;
char incomingPacket[256];

void DEBUG(String msg) {
  Serial.println("0"+msg);
}

void COMM(String msg) {
  Serial.println("1"+msg);
}



void setup(void)
{ 
  Serial.begin(4800);
  delay(500);
  WiFi.begin(ssid, password);
  DEBUG("Booting ESP8266...");
  while (WiFi.status() != WL_CONNECTED) 
    delay(250);
  
  DEBUG("WiFi Connected: " + WiFi.localIP().toString());

  udp.begin(localPort);
  DEBUG("Socket open on port "+String(localPort));
}

void loop() 
{
  String msg = "";
  boolean available = false;
  while(Serial.available()) {
    msg += Serial.readString();
    available = true;
  }
  if(available) {
    char controlCode = msg.charAt(0);
    msg = msg.substring(1);
    if(controlCode == '1') {
      DEBUG("Sending: "+msg);
      udp.beginPacket(serverIP, serverPort);
      udp.write(msg.c_str());
      udp.endPacket();
    }
  }
}