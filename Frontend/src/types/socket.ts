// src/types/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL; // https://jgaa-project-backend.onrender.com

// ✅ Create the socket connection ONCE
const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // fallback for Render
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  autoConnect: true,
});

// ✅ Optional: log connection state for debugging
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Disconnected from server:", reason);
});

export default socket;
