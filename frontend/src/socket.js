// socket.js
import { io } from "socket.io-client";
const url = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(url, {
  auth: { token: localStorage.getItem("token") },
  transports: ["websocket"]
});
export default socket;
