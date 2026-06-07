import { Router } from "express";
import { z } from "zod";
import { executeCommand } from "../services/commands.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const commandSchema = z.object({
  command: z.string().min(1).max(500),
});

router.post("/", validate(commandSchema), (req, res, next) => {
  try {
    const result = executeCommand(req.user.id, req.body.command);

    if (result.type === "export") {
      return res.json({
        type: "export",
        data: result.store,
        mutated: false,
        level: "success",
      });
    }

    if (result.type === "empty") {
      return res.json({ type: "empty", mutated: false });
    }

    res.json({
      type: result.type,
      message: result.message,
      level: result.level,
      mutated: result.mutated ?? false,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
