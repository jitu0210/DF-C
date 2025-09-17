import ModbusRTU from "modbus-serial";

const client = new ModbusRTU();
const RELAY_ID = 1;
let connected = false;

async function connectTCP() {
  try {
    await client.connectTCP("192.168.50.20", { port: 502 });
    client.setID(RELAY_ID);
    connected = true;
    console.log("✅ Connected to Modbus TCP relay");
  } catch (err) {
    connected = false;
    console.error("❌ Failed to connect:", err.message);
    setTimeout(connectTCP, 5000);
  }
}

async function ensureConnection() {
  if (!connected || !client.isOpen) {
    connected = false;
    console.log("🔄 Reconnecting Modbus...");
    await connectTCP();
  }
}

function isConnected() {
  return connected;
}

export { client, connectTCP, ensureConnection, isConnected };