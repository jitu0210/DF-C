import { Router } from "express";
import { ensureConnected } from "../middlewares/ensureConnected.js";
import { controlBTS, btsIn, btsOut } from "../controllers/io.controller.js";

const router = Router();

router.post("/bts/control", ensureConnected, controlBTS);
router.post("/bts/in", ensureConnected, btsIn);
router.post("/bts/out", ensureConnected, btsOut);

export default router;
