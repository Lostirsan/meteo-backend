import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./db/database.js";

const app = express();

app.use(cors());
app.use(express.json());

/* ===== Health check ===== */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===== REGISTER ===== */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)"
    ).run(username, hashedPassword);

    res.json({ success: true });
  } catch (err) {
    res.status(409).json({ message: "User already exists" });
  }
});

/* ===== LOGIN ===== */
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

/* ===== SERVER START ===== */
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
