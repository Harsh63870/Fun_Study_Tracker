import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_SUBJECTS } from "./utils/subjects.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "study.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      goal_hours REAL DEFAULT 0,
      UNIQUE(user_id, name),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      hours REAL NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      notes TEXT DEFAULT '',
      archived INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      deadline TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const demo = db.prepare("SELECT id FROM users WHERE username = ?").get("demo");
  if (!demo) {
    const hash = bcrypt.hashSync("demo123", 10);
    const result = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("demo", hash);
    seedSubjects(result.lastInsertRowid);
  }
}

function seedSubjects(userId) {
  const insert = db.prepare("INSERT OR IGNORE INTO subjects (user_id, name, goal_hours) VALUES (?, ?, 0)");
  for (const name of DEFAULT_SUBJECTS) {
    insert.run(userId, name);
  }
}

export function ensureUserSubjects(userId) {
  const count = db.prepare("SELECT COUNT(*) as c FROM subjects WHERE user_id = ?").get(userId).c;
  if (count === 0) seedSubjects(userId);
}

export default db;
