import Database from "better-sqlite3";

const db = new Database("users.db");

// создаём таблицу, если нет
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

export default db;
