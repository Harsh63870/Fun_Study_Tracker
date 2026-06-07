import { Router } from "express";
import { loadStore } from "../services/store.js";

const router = Router();

router.get("/", (req, res) => {
  const store = loadStore(req.user.id);
  const sessions = store.sessions.filter((s) => !s.archived);
  res.json(sessions);
});

export default router;
