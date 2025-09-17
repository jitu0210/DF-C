import { client, ensureConnection } from "../utils/modbus.js";

export async function controlBTS(req, res) {
  try {
    const { command } = req.body;

    if (!command || !["in", "out"].includes(command)) {
      return res.status(400).json({
        error: "Invalid command. Use { \"command\": \"in\" } or { \"command\": \"out\" }",
      });
    }

    let address;
    if (command === "in") {
      address = 0x7801; // IN coil
    } else if (command === "out") {
      address = 0x7802; // OUT coil
    }

    await ensureConnection();

    // Send a short pulse to coil
    await client.writeCoil(address, true);
    setTimeout(async () => {
      try {
        await client.writeCoil(address, false);
        console.log(`✅ BTS ${command.toUpperCase()} pulse completed at ${address.toString(16)}`);
      } catch (err) {
        console.error("❌ Failed to reset coil:", err.message);
      }
    }, 500); // 500ms pulse

    res.json({
      success: true,
      message: `BTS ${command.toUpperCase()} command sent`,
      address: address.toString(16),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}