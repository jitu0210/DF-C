import { client, ensureConnection } from "../utils/modbus.js";

export async function resetBTS(req, res) {
  try {
    const BTS_RESET_ADDR = 0x7805;
    await client.writeCoil(BTS_RESET_ADDR, true);

    setTimeout(async () => {
      try {
        await client.writeCoil(BTS_RESET_ADDR, false);
        console.log(
          `BTS reset pulse completed at ${BTS_RESET_ADDR.toString(16)}`
        );
      } catch (err) {
        console.error("Failed to reset BTS coil:", err.message);
      }
    }, 500);

    res.json({
      success: true,
      message: "BTS reset command sent",
      address: BTS_RESET_ADDR.toString(16),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
