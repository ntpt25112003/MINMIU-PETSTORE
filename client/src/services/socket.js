import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8081";

// Create singleton Socket.IO client instance
export const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("⚡ [Socket.IO Client] Connected to server, ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ [Socket.IO Client] Connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 [Socket.IO Client] Disconnected:", reason);
});

export default socket;
