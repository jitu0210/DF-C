import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { operateBreaker } from "../controllers/lt.controller.js";

const router = Router();

router.post("/breaker/operate", ensureConnected, operateBreaker);

export default router;