import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { streamVoltage, streamCurrent, streamFrequency, streamPhaseDiff } from "../controllers/analog.controller.js";

const router = Router();

router.get("/voltage", ensureConnected, streamVoltage);
router.get("/current", ensureConnected, streamCurrent);
router.get("/frequency", ensureConnected, streamFrequency);
router.get("/phase-diff", ensureConnected, streamPhaseDiff);

export default router;