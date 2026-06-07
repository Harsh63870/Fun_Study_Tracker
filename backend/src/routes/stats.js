import { Router } from "express";
import { loadStore } from "../services/store.js";
import { buildStatsPayload } from "../services/stats.js";

const router = Router();

router.get("/", (req, res) => {
  const store = loadStore(req.user.id);
  res.json(buildStatsPayload(store));
});

export default router;
