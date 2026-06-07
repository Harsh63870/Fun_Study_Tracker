import { Router } from "express";
import { z } from "zod";
import { loadStore, persistStore, resetUserData } from "../services/store.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const importSchema = z.object({
  sessions: z.array(z.any()),
  tasks: z.array(z.any()),
  subjects: z.array(z.string()).optional(),
  subjectGoals: z.record(z.number()).optional(),
});

router.get("/export", (req, res) => {
  res.json(loadStore(req.user.id));
});

router.post("/import", validate(importSchema), (req, res, next) => {
  try {
    const data = req.body;
    const store = {
      sessions: data.sessions || [],
      tasks: data.tasks || [],
      subjects: data.subjects?.length ? data.subjects : loadStore(req.user.id).subjects,
      subjectGoals: data.subjectGoals || {},
      nextSessionId: Math.max(0, ...data.sessions.map((s) => s.id || 0)) + 1,
      nextTaskId: Math.max(0, ...data.tasks.map((t) => t.id || 0)) + 1,
    };
    persistStore(req.user.id, store);
    res.json({ message: "Import successful", mutated: true });
  } catch (err) {
    next(err);
  }
});

router.post("/reset", (req, res) => {
  resetUserData(req.user.id);
  res.json({ message: "All data cleared", mutated: true });
});

export default router;
