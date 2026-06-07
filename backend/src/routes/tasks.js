import { Router } from "express";
import { loadStore } from "../services/store.js";

const router = Router();

router.get("/", (req, res) => {
  const store = loadStore(req.user.id);
  const status = req.query.status;
  let tasks = store.tasks;
  if (status) tasks = tasks.filter((t) => t.status === status);
  res.json(tasks);
});

export default router;
