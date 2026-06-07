import { config } from "../config.js";

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
}
