import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { resetBTS } from "../controllers/reset.controller.js";

const router = Router();

router.post("/bts/reset", ensureConnected, resetBTS);

export default router;