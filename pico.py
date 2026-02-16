from machine import Pin, ADC, I2C
import time
import onewire, ds18x20
import network
import bme680
import json
from umqtt.simple import MQTTClient

SSID = "W-FPL29"
PASSWORD = "153389.Fried.P"

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883

DATA_TOPIC = "greenhouse/greenhouse_1"
CMD_TOPIC = "greenhouse/greenhouse_1/cmd"

CLIENT_ID = "pico_greenhouse_1"
DEVICE_ID = "greenhouse_1"

LED_PIN = 0
led = Pin(LED_PIN, Pin.OUT)
led.off()

DS18B20_PIN = 8
SOIL_PIN = 26

BME_SDA = 4
BME_SCL = 5

BH_SDA = 2
BH_SCL = 3

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(SSID, PASSWORD)
        while not wlan.isconnected():
            time.sleep(1)
    return wlan

def mqtt_callback(topic, msg):
    try:
        data = json.loads(msg.decode())
        if data.get("led") == "on":
            led.on()
        elif data.get("led") == "off":
            led.off()
    except:
        pass

def connect_mqtt():
    client = MQTTClient(CLIENT_ID, MQTT_BROKER, MQTT_PORT, keepalive=60)
    client.set_callback(mqtt_callback)
    client.connect()
    client.subscribe(CMD_TOPIC)
    return client

wlan = connect_wifi()
client = connect_mqtt()

ow = onewire.OneWire(Pin(DS18B20_PIN))
ds = ds18x20.DS18X20(ow)
roms = ds.scan()

soil = ADC(Pin(SOIL_PIN))

i2c_bme = I2C(0, sda=Pin(BME_SDA), scl=Pin(BME_SCL), freq=100000)
bme = bme680.BME680_I2C(i2c_bme, address=0x77)
bme.sea_level_pressure = 1013.25

i2c_bh = I2C(1, sda=Pin(BH_SDA), scl=Pin(BH_SCL), freq=100000)

def read_bh1750():
    addr = 0x23
    i2c_bh.writeto(addr, b'\x10')
    time.sleep(0.2)
    data = i2c_bh.readfrom(addr, 2)
    return (data[0] << 8 | data[1]) / 1.2

last_send = time.time()

while True:
    try:
        if not wlan.isconnected():
            wlan = connect_wifi()

        try:
            client.check_msg()
            client.ping()
        except:
            client = connect_mqtt()

        if time.time() - last_send >= 60:
            try:
                air_temp = bme.temperature
                air_hum = bme.humidity
                air_press = bme.pressure
                gas = bme.gas
            except:
                air_temp = air_hum = air_press = gas = 0

            try:
                ds.convert_temp()
                time.sleep_ms(750)
                water_temp = ds.read_temp(roms[0])
            except:
                water_temp = 0

            soil_value = soil.read_u16()

            try:
                light = read_bh1750()
            except:
                light = 0

            payload = {
                "device_id": DEVICE_ID,
                "air_temp": round(air_temp, 2),
                "air_hum": round(air_hum, 2),
                "air_press": round(air_press, 2),
                "gas": round(gas, 2),
                "water_temp": round(water_temp, 2),
                "soil": soil_value,
                "light": round(light, 2)
            }

            client.publish(DATA_TOPIC, json.dumps(payload))
            last_send = time.time()

    except:
        pass

    time.sleep(0.1)

