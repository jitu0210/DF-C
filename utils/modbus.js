import ModbusRTU from "modbus-serial";

const client = new ModbusRTU();
const RELAY_ID = 1;
let connected = false;

// Connect Modbus TCP
async function connectTCP() {
  try {
    if (client._port?.isOpen) {
      await client.close(); // close old connection if exists
    }

    await client.connectTCP("192.168.50.20", { port: 502 });
    client.setID(RELAY_ID);

    connected = true;
    console.log("Connected to Modbus TCP relay");
  } catch (err) {
    connected = false;
    console.error("Failed to connect:", err.message);
    setTimeout(connectTCP, 5000); // retry after 5s
  }
}

// Ensure connection alive
async function ensureConnection() {
  if (!connected || !client._port?.isOpen) {
    connected = false;
    console.log("🔄 Reconnecting Modbus...");
    await connectTCP();
  }
}

function isConnected() {
  return connected && client._port?.isOpen;
}

export { client, connectTCP, ensureConnection, isConnected };