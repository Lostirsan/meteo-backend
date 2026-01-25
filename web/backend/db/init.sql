CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,

    air_temp_min REAL,
    air_temp_max REAL,

    air_hum_min REAL,
    air_hum_max REAL,

    air_press_min REAL,
    air_press_max REAL,

    gas_min REAL,
    gas_max REAL,

    water_temp_min REAL,
    water_temp_max REAL,

    soil_min INTEGER,
    soil_max INTEGER,

    light_min REAL,
    light_max REAL
);

CREATE TABLE IF NOT EXISTS user_devices (
  user_id INT UNIQUE,
  device_name TEXT,
  device_uid TEXT,
  plant_id INT REFERENCES plants(id)
);

CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  device_id TEXT,
  time TIMESTAMP,
  air_temp FLOAT,
  air_hum FLOAT,
  air_press FLOAT,
  gas FLOAT,
  water_temp FLOAT,
  soil FLOAT,
  light FLOAT
);

INSERT INTO plants (
  name,
  air_temp_min, air_temp_max,
  air_hum_min, air_hum_max,
  air_press_min, air_press_max,
  gas_min, gas_max,
  water_temp_min, water_temp_max,
  soil_min, soil_max,
  light_min, light_max
) VALUES

('Wheat',
  0, 40,
  30, 70,
  980, 1030,
  0, 10000,
  5, 25,
  20000, 50000,
  10, 50
),

('Corn',
  10, 35,
  40, 80,
  980, 1030,
  0, 12000,
  10, 28,
  25000, 55000,
  15, 60
),

('Tomato',
  12, 30,
  50, 85,
  980, 1030,
  0, 15000,
  10, 26,
  20000, 45000,
  20, 70
),

('Cucumber',
  14, 28,
  60, 90,
  980, 1030,
  0, 14000,
  12, 25,
  25000, 50000,
  25, 75
),

('Potato',
  8, 25,
  40, 75,
  980, 1030,
  0, 13000,
  6, 22,
  22000, 48000,
  15, 55
),

('Carrot',
  5, 25,
  35, 70,
  980, 1030,
  0, 12000,
  5, 20,
  18000, 42000,
  10, 50
),

('Lettuce',
  5, 20,
  50, 80,
  980, 1030,
  0, 10000,
  4, 18,
  15000, 35000,
  8, 40
),

('Strawberry',
  10, 28,
  60, 85,
  980, 1030,
  0, 13000,
  8, 22,
  22000, 48000,
  15, 60
),

('Barley',
  0, 35,
  30, 65,
  980, 1030,
  0, 10000,
  5, 24,
  20000, 45000,
  10, 50
),

('Sunflower',
  12, 38,
  30, 70,
  980, 1030,
  0, 15000,
  10, 26,
  30000, 60000,
  20, 80
);
