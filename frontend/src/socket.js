// socket.js
import { io } from "socket.io-client";
const url = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const socket = io(url, {
  auth: { token: localStorage.getItem("token") },
  transports: ["websocket"]  // optional, helps on some platforms
});
export default socket;
