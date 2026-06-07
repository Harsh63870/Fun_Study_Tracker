import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.userId, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function signToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, {
    expiresIn: "7d",
  });
}
