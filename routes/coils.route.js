import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { readCoil, writeCoil, writeCoils } from "../controllers/coils.controller.js";

const router = Router();

router.get("/read-coil/:addr", ensureConnected, readCoil);
router.post("/write-coil/:addr/:value", ensureConnected, writeCoil);
router.post("/write-coils/:start", ensureConnected, writeCoils);

export default router;