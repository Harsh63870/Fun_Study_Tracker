import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db, { ensureUserSubjects } from "../db.js";
import { signToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const credentialsSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(128),
});

router.post("/register", validate(credentialsSchema), (req, res, next) => {
  try {
    const { username, password } = req.body;
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, hash);
    ensureUserSubjects(result.lastInsertRowid);

    const user = { id: result.lastInsertRowid, username };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(credentialsSchema), (req, res, next) => {
  try {
    const { username, password } = req.body;
    const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = { id: row.id, username: row.username };
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

export default router;
