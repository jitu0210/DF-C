import { client, ensureConnection } from "../utils/modbus.js";

async function readRegister(addr) {
  await ensureConnection();
  const data = await client.readHoldingRegisters(addr, 1);
  return data.data.length > 0 ? data.data[0] : null;
}

function startStream(res, addr, label, unit, scale = 1) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.write(`📡 Streaming ${label} every 5 seconds:\n\n`);

  const interval = setInterval(async () => {
    try {
      let rawVal = await readRegister(addr);
      let actualVal = (rawVal * scale).toFixed(2);
      const msg = `${new Date().toLocaleTimeString()} - ${label}: ${actualVal} ${unit}\n`;
      console.log(msg.trim());
      res.write(msg);
    } catch (err) {
      const errMsg = `Error reading ${label}: ${err.message}\n`;
      console.error(errMsg.trim());
      res.write(errMsg);
    }
  }, 5000);

  res.on("close", () => clearInterval(interval));
}

export const streamVoltage = (req, res) =>
  startStream(res, 0x4001, "Voltage", "V", 0.1);
export const streamCurrent = (req, res) =>
  startStream(res, 0x0003, "Current", "A", 0.1);
export const streamFrequency = (req, res) =>
  startStream(res, 0x0006, "Frequency", "Hz", 0.01);
export const streamPhaseDiff = (req, res) =>
  startStream(res, 0x0007, "Phase Difference", "°", 0.1);
