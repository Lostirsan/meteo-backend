import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
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

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

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
      time: new Date().toISOString()
    });
  } catch (err) {
    console.error("Weather error:", err);
    res.status(500).json({ error: "Weather API failed" });
  }
});

/* =========================
   REGISTER
========================= */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)"
    ).run(username, hashedPassword);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: "User already exists" });
  }
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username
    }
  });
});

/* =========================
   SERVER START
========================= */
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
