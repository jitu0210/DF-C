import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { getBTSStatus } from "../controllers/status.controller.js";

const router = Router();

router.get("/bts/status", ensureConnected, getBTSStatus);

export default router;