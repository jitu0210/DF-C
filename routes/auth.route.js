import express from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  getProfile,
  protectedResource,
} from "../controllers/auth.controller.js";
import { validateLogin } from "../middlewares/validation.middleware.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import config from "../config/env.config.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use("/login", authLimiter);

router.post("/login", validateLogin, login);
router.get("/profile", authenticate, getProfile);
router.get("/protected", authenticate, protectedResource);

export default router;
