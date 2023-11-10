# Hardware Configuration

The SmartPot consists of two firmware modules, Arduino and ESP8266.

# Arduino

Arduino.ino must be flashed onto an arduino. The arduino must be wired as follows:

Pin | Connected To
-- | --
A7 | Moisture Sensor
D6 | RX of ESP8266 (Used as virtual TX)
D7 | TX of ESP8266 (Used as virtual RX)

Additionally, the SERIAL_NUMBER constant must be defined before flashing, to give the pot its serial number

# ESP8266

ESP8266.ino must be flashed onto an ESP8266. The ESP8266 must be wired as follows:

Pin | Connected To
-- | --
RX | D6 of Arduino
TX | D7 of Arduino

Additionally, the following variables must be set before flashing:

Variable | Purpose
-- | --
ssid | ssid of the WiFi network to connect to
password | password of the WiFi network to connect to
serverIP | the IP of the server to send statistics to
serverPort | the port to send statistics to

To program an ESP8266 using the Arduino IDE, you will have to add the following to "Aditional Boards Manager URLs" in the settings:
`http://arduino.esp8266.com/stable/package_esp8266com_index.json`