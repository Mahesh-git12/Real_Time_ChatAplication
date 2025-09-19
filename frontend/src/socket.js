import { io } from "socket.io-client";

// Use environment variable for backend socket URL
const API_BASE = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token") || "";

// Use API_BASE instead of hardcoded localhost
const socket = io(API_BASE, { auth: { token } });

export default socket;

// import { io } from "socket.io-client";
// const API_BASE = process.env.REACT_APP_API_URL;
// const token = localStorage.getItem("token") || "";
// const socket = io("http://localhost:5000", { auth: { token } });
// export default socket;
