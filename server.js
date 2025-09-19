import express from "express";
import cors from "cors";
import { connectTCP } from "./utils/modbus.js";

import analogRoutes from "./routes/analog.route.js";
import authRoutes from "./routes/auth.route.js"
import coilsRoutes from "./routes/coils.route.js";
import ioRoutes from "./routes/io.route.js";
import ltRoutes from "./routes/lt.route.js";
import resetRoutes from "./routes/reset.route.js";
import statusRoutes from "./routes/status.route.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

// modbus connection
connectTCP();

app.use("/api", analogRoutes);
app.use("/api", authRoutes);
app.use("/api", coilsRoutes);
app.use("/api", ioRoutes);
app.use("/api", ltRoutes);
app.use("/api", resetRoutes);
app.use("/api", statusRoutes);

app.listen(port, () =>
  console.log(`Server running at port ${port}`)
);

// const express = require("express");
// const cors = require("cors")
// const ModbusRTU = require("modbus-serial");

// const app = express();
// const port = 8000;

// app.use(express.json());
// app.use(cors());

// const client = new ModbusRTU();
// const RELAY_ID = 1;
// let connected = false;

// // ------------------- Connection Handling -------------------
// async function connectTCP() {
//   try {
//     await client.connectTCP("192.168.50.20", { port: 502 });
//     client.setID(RELAY_ID);
//     connected = true;
//     console.log("✅ Connected to Modbus TCP relay");
//   } catch (err) {
//     connected = false;
//     console.error("❌ Failed to connect:", err.message);
//     setTimeout(connectTCP, 5000); // retry after 5s
//   }
// }

// // Helper: ensure connection is open before reading
// async function ensureConnection() {
//   if (!connected || !client.isOpen) {
//     connected = false;
//     console.log("🔄 Reconnecting Modbus...");
//     await connectTCP();
//   }
// }

// // Start connection attempt
// connectTCP();

// // Middleware to block requests if no connection
// function ensureConnected(req, res, next) {
//   if (!connected) {
//     return res.status(503).json({ error: "Modbus client not connected" });
//   }
//   next();
// }

// // ------------------- Coils -------------------

// // Read coils
// app.get("/api/read-coils/:start/:length", ensureConnected, async (req, res) => {
//   try {
//     let start = parseInt(req.params.start);
//     const length = parseInt(req.params.length);

//     if (req.query.hex === "true") {
//       start = parseInt(req.params.start, 16); // interpret as hex
//     }

//     await ensureConnection();
//     const data = await client.readCoils(start, length);

//     const coils = data.data.map((v, i) => ({
//       coil: start + i,
//       status: v ? "ON" : "OFF",
//     }));

//     res.json({
//       coilAddress: start,
//       status: coils[0].status,
//       details: coils,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Write single coil
// app.post("/api/write-coil/:addr/:value", ensureConnected, async (req, res) => {
//   try {
//     let addr = parseInt(req.params.addr);
//     if (req.query.hex === "true") {
//       addr = parseInt(req.params.addr, 16);
//     }

//     const value = parseInt(req.params.value) === 1;
//     await ensureConnection();
//     await client.writeCoil(addr, value);

//     res.json({ addr, written: value ? "ON" : "OFF" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Write multiple coils
// app.post("/api/write-coils/:start", ensureConnected, async (req, res) => {
//   try {
//     let start = parseInt(req.params.start);
//     if (req.query.hex === "true") {
//       start = parseInt(req.params.start, 16);
//     }

//     const values = (req.query.values || "")
//       .split(",")
//       .map((v) => v.trim() === "1");

//     await ensureConnection();
//     await client.writeCoils(start, values);

//     res.json({
//       start,
//       written: values.map((v) => (v ? "ON" : "OFF")),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Helper: read discrete input
// async function readInput(address) {
//   await ensureConnection();
//   const data = await client.readDiscreteInputs(address, 1);
//   return data.data[0] ? 1 : 0; // return 1 or 0
// }

// // BTS status
// app.get("/api/bts/status", ensureConnected, async (req, res) => {
//   try {
//     const onStatus = await readInput(0x7801); // 1 = ON, 0 = OFF
//     const offStatus = onStatus === 1 ? 0 : 1; // derive OFF automatically

//     const statusText = onStatus === 1 ? "BTS is IN" : "BTS is OUT";

//     res.json({
//       bts: {
//         onAddress: "7801",
//         offAddress: "7802",
//         raw: { on: onStatus, off: offStatus },
//         status: statusText,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Auto-refresh BTS status
// setInterval(async () => {
//   if (!connected) return;
//   try {
//     const onStatus = await readInput(0x7801);
//     const offStatus = await readInput(0x7802);

//     let statusText = "Unknown";
//     if (onStatus === 1) statusText = "BTS is IN";
//     else if (offStatus === 1) statusText = "BTS is OUT";

//   } catch (err) {
//     console.error("❌ Auto-refresh failed:", err.message);
//   }
// }, 10000);

// // Write to BTS control coils
// async function writeBTS(addr, value) {
//   await ensureConnection();
//   return client.writeCoil(addr, value);  // writeCoil for ON/OFF
// }

// // Control endpoint
// app.post("/api/bts/control", ensureConnected, async (req, res) => {
//   try {
//     const { command } = req.body;

//     if (!command || !["in", "out"].includes(command)) {
//       return res.status(400).json({
//         error: "Invalid command. Use { \"command\": \"in\" } or { \"command\": \"out\" }",
//       });
//     }

//     let address;
//     if (command === "in") {
//       address = 0x7801; // IN address
//     } else if (command === "out") {
//       address = 0x7802; // OUT address
//     }

//     // Write coil as a pulse
//     await client.writeCoil(address, true);
//     setTimeout(async () => {
//       try {
//         await client.writeCoil(address, false);
//         console.log(`✅ Pulse completed at ${address.toString(16)}`);
//       } catch (err) {
//         console.error("❌ Failed to reset coil:", err.message);
//       }
//     }, 500); // 500 ms pulse

//     res.json({
//       success: true,
//       message: `BTS switching ${command.toUpperCase()} command sent`,
//       address: address.toString(16),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ------------------- BTS Reset Endpoint ------------------- //
// app.post("/api/bts/reset", ensureConnected, async (req, res) => {
//   try {
//     const BTS_RESET_ADDR = 0x7805; // Reset coil address

//     // Send short pulse to reset BTS
//     await client.writeCoil(BTS_RESET_ADDR, true);
//     setTimeout(async () => {
//       try {
//         await client.writeCoil(BTS_RESET_ADDR, false);
//         console.log(`✅ BTS reset pulse completed at ${BTS_RESET_ADDR.toString(16)}`);
//       } catch (err) {
//         console.error("❌ Failed to reset BTS coil:", err.message);
//       }
//     }, 500); // 0.5 second pulse

//     res.json({
//       success: true,
//       message: "BTS reset command sent",
//       address: BTS_RESET_ADDR.toString(16),
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to send BTS reset command",
//       error: err.message,
//     });
//   }
// });

// // ------------------- Breaker Operate Endpoint -------------------
// app.post("/api/breaker/operate", ensureConnected, async (req, res) => {
//   try {
//     const BREAKER_ADDR = 0x7806; // Breaker coil address

//     // Send short pulse to operate breaker
//     await client.writeCoil(BREAKER_ADDR, true);
//     setTimeout(async () => {
//       try {
//         await client.writeCoil(BREAKER_ADDR, false);
//         console.log(`✅ Breaker operate pulse completed at ${BREAKER_ADDR.toString(16)}`);
//       } catch (err) {
//         console.error("❌ Failed to pulse breaker coil:", err.message);
//       }
//     }, 500); // 0.5 second pulse

//     res.json({
//       success: true,
//       message: "Breaker operate command sent",
//       address: BREAKER_ADDR.toString(16),
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to send breaker operate command",
//       error: err.message,
//     });
//   }
// });

// // ------------------- Analog Measurements ------------------- //

// async function readRegister(addr) {
//   await ensureConnection();
//   const data = await client.readHoldingRegisters(addr, 1);
//   return data.data.length > 0 ? data.data[0] : null;
// }

// function startStream(res, addr, label, unit, scale = 1) {
//   res.setHeader("Content-Type", "text/plain; charset=utf-8");
//   res.setHeader("Cache-Control", "no-cache");
//   res.write(`📡 Streaming ${label} every 5 seconds:\n\n`);

//   const interval = setInterval(async () => {
//     try {
//       let rawVal = await readRegister(addr);
//       let actualVal = (rawVal * scale).toFixed(2);
//       const msg = `${new Date().toLocaleTimeString()} - ${label}: ${actualVal} ${unit}\n`;
//       console.log(msg.trim());
//       res.write(msg);
//     } catch (err) {
//       const errMsg = `❌ Error reading ${label}: ${err.message}\n`;
//       console.error(errMsg.trim());
//       res.write(errMsg);
//     }
//   }, 5000);

//   res.on("close", () => clearInterval(interval));
// }

// // Voltage
// app.get("/api/voltage", ensureConnected, (req, res) => {
//   startStream(res, 0x4001, "Voltage", "V", 0.1);
// });

// // Current
// app.get("/api/current", ensureConnected, (req, res) => {
//   startStream(res, 0x0003, "Current", "A", 0.1);
// });

// // Frequency
// app.get("/api/frequency", ensureConnected, (req, res) => {
//   startStream(res, 0x0006, "Frequency", "Hz", 0.01);
// });

// // Phase Difference
// app.get("/api/phase-diff", ensureConnected, (req, res) => {
//   startStream(res, 0x0007, "Phase Difference", "°", 0.1);
// });

// // ------------------- Server ------------------- //
// app.listen(port, () =>
//   console.log(`🚀 Modbus REST API server running at http://localhost:${port}`)
// );
