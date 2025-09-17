// controllers/coils.controller.js
import { client, ensureConnection } from "../utils/modbus.js";

export async function readCoil(req, res) {
  try {
    let addr = parseInt(req.params.addr);

    if (req.query.hex === "true") {
      addr = parseInt(req.params.addr, 16); 
    }

    await ensureConnection();

    const data = await client.readCoils(addr, 1);
    const status = data.data[0] ? "ON" : "OFF";

    res.json({
      coilAddress: addr,
      status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function writeCoil(req, res) {
  try {
    let addr = parseInt(req.params.addr);
    if (req.query.hex === "true") addr = parseInt(req.params.addr, 16);

    const value = parseInt(req.params.value) === 1;
    await ensureConnection();
    await client.writeCoil(addr, value);

    res.json({ addr, written: value ? "ON" : "OFF" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function writeCoils(req, res) {
  try {
    let start = parseInt(req.params.start);
    if (req.query.hex === "true") start = parseInt(req.params.start, 16);

    const values = (req.query.values || "").split(",").map((v) => v.trim() === "1");

    await ensureConnection();
    await client.writeCoils(start, values);

    res.json({ start, written: values.map((v) => (v ? "ON" : "OFF")) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}