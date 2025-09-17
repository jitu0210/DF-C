import { client, ensureConnection } from "../utils/modbus.js";

async function readInput(address) {
  await ensureConnection();
  const data = await client.readDiscreteInputs(address, 1);
  return data.data[0] ? 1 : 0;
}

export async function getBTSStatus(req, res) {
  try {
    const onStatus = await readInput(0x7801);
    const offStatus = onStatus === 1 ? 0 : 1;

    const statusText = onStatus === 1 ? "BTS is IN" : "BTS is OUT";

    res.json({
      bts: {
        onAddress: "7801",
        offAddress: "7802",
        raw: { on: onStatus, off: offStatus },
        status: statusText,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}