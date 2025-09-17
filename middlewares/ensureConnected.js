import { isConnected } from "../utils/modbus.js";

export function ensureConnected(req, res, next) {
  if (!isConnected()) {
    return res.status(503).json({ error: "Modbus client not connected" });
  }
  next();
}