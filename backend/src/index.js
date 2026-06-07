import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { initDb } from "./db.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import commandRoutes from "./routes/commands.js";
import sessionRoutes from "./routes/sessions.js";
import taskRoutes from "./routes/tasks.js";
import statsRoutes from "./routes/stats.js";
import dataRoutes from "./routes/data.js";

initDb();

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

app.use("/api/commands", authMiddleware, commandRoutes);
app.use("/api/sessions", authMiddleware, sessionRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/stats", authMiddleware, statsRoutes);
app.use("/api/data", authMiddleware, dataRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Study Tracker API running on http://localhost:${config.port}`);
});
