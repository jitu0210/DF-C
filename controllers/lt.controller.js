import { client, ensureConnection } from "../utils/modbus.js";

export async function operateBreaker(req, res) {
  try {
    const BREAKER_ADDR = 0x7806;
    await client.writeCoil(BREAKER_ADDR, true);

    setTimeout(async () => {
      try {
        await client.writeCoil(BREAKER_ADDR, false);
        console.log(
          `Breaker operate pulse completed at ${BREAKER_ADDR.toString(16)}`
        );
      } catch (err) {
        console.error("Failed to pulse breaker coil:", err.message);
      }
    }, 500);

    res.json({
      success: true,
      message: "Breaker operate command sent",
      address: BREAKER_ADDR.toString(16),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
