import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import db from "./db/database.js";

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/debug/db", async (req, res) => {
  const dbName = await db.query("select current_database()");
  const schema = await db.query("select current_schema()");
  const tables = await db.query(`
    select table_schema, table_name 
    from information_schema.tables 
    where table_name IN ('plants', 'users', 'measurements')
  `);

  res.json({
    database: dbName.rows,
    schema: schema.rows,
    tables: tables.rows
  });
});

/* =========================
   WEATHER (Košice)
========================= */
app.get("/api/weather", async (req, res) => {
  try {
    const city = "Kosice";
    const apiKey = process.env.WEATHER_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Weather API key missing" });
    }

    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(500).json({ error: "Weather API error", details: data });
    }

    res.json({
      city: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Weather API failed" });
  }
});

/* =========================
   PLANTS
========================= */
app.get("/api/plants", async (req, res) => {
  try {
    const result = await db.query("SELECT id, name FROM plants ORDER BY name");
    res.json(result.rows);
  } catch (e) {
    console.error("PLANTS ERROR:", e);
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/api/plants/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM plants WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load plant" });
  }
});

/* =========================
   USERS
========================= */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hash]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (e) {
    console.error(e);
    res.status(409).json({ message: "User already exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    success: true,
    user: { id: user.id, username: user.username },
  });
});

/* =========================
   USER DEVICE
========================= */
app.get("/api/user/device", async (req, res) => {
  const userId = 1;

  const { rows } = await db.query(`
    SELECT 
      ud.device_name,
      ud.device_uid,
      p.name as plant_name,
      p.id as plant_id
    FROM user_devices ud
    LEFT JOIN plants p ON p.id = ud.plant_id
    WHERE ud.user_id = $1
  `, [userId]);

  res.json(rows[0] || null);
});

app.post("/api/user/device", async (req, res) => {
  const userId = 1;
  const { deviceName, deviceUid, plantId } = req.body;

  await db.query(`
    INSERT INTO user_devices (user_id, device_name, device_uid, plant_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET
      device_name = EXCLUDED.device_name,
      device_uid = EXCLUDED.device_uid,
      plant_id = EXCLUDED.plant_id
  `, [userId, deviceName, deviceUid, plantId]);

  res.json({ success: true });
});

app.delete("/api/user/device", async (req, res) => {
  const userId = 1;
  await db.query("DELETE FROM user_devices WHERE user_id = $1", [userId]);
  res.json({ success: true });
});

/* =========================
   MEASUREMENTS (FROM PICO)
========================= */
app.post("/api/measurements", async (req, res) => {
  const {
    device_id,
    air_temp,
    air_hum,
    air_press,
    gas,
    water_temp,
    soil,
    light
  } = req.body;

  try {
    await db.query(`
      INSERT INTO measurements 
      (device_id, time, air_temp, air_hum, air_press, gas, water_temp, soil, light)
      VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8)
    `, [device_id, air_temp, air_hum, air_press, gas, water_temp, soil, light]);

    res.json({ success: true });
  } catch (e) {
    console.error("MEASUREMENTS ERROR:", e);
    res.status(500).json({ error: "Failed to save measurements" });
  }
});

/* =========================
   GET MEASUREMENTS FOR LAST 30 DAYS
========================= */
app.get("/api/measurements/month/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    const result = await db.query(`
      SELECT time, air_temp, air_hum, air_press, gas, water_temp, soil, light
      FROM measurements
      WHERE device_id = $1
        AND time >= NOW() - INTERVAL '30 days'
      ORDER BY time ASC
    `, [deviceId]);

    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch measurements" });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
});
