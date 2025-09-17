import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { controlBTS } from "../controllers/io.controller.js";

const router = Router();

router.post("/bts/control", ensureConnected, controlBTS);

export default router;