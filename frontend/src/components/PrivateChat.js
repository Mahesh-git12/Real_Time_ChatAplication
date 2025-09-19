// src/pages/Private.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useParams } from "react-router-dom";
import axios from "axios";

// ✅ Use environment variable
const API_BASE = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token");

// 🎨 Colors
const colors = {
  chatBg: "linear-gradient(135deg, #222040 0%, #16182d 100%)",
  headerBg: "rgba(40,50,110,0.94)",
  sentBg: "linear-gradient(135deg, #42f5fc 0%, #8f41f5 90%)",
  sentText: "#f4faff",
  sentShadow: "0 4px 24px #30e6ff33,0 1px 10px #c554f7cc",
  receivedBg: "linear-gradient(135deg, #232753 60%, #45268f 100%)",
  receivedText: "#e4e1ff",
  receivedShadow: "0 4px 20px #302a5833,0 1px 6px #492bc5aa",
  inputBg: "#212550",
  inputText: "#e7e6fd",
  toolbarBg: "rgba(30,32,55, 0.94)",
  inputBorder: "#3e45a3",
  buttonBg: "linear-gradient(90deg,#8469f6 50%, #31c0f6 100%)",
  buttonText: "#fff",
  buttonDisabled: "#7062a2",
  attach: "#ffe577",
  attachBg: "#2b2e5d",
  timestampSent: "#70e6fe",
  timestampReceived: "#bea2ff",
};

function PrivateChat({ userId, username,socket }) {
  const { userId: partnerId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // ⭐ Particle BG
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // ⭐ Fetch partner info
  useEffect(() => {
    async function fetchPartner() {
      try {
        const res = await axios.get(`${API_BASE}/api/users/${partnerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPartner(res.data);
      } catch {
        setPartner(null);
      }
    }
    if (partnerId) fetchPartner();
  }, [partnerId]);

  // ⭐ Fetch chat history
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/chat/private/${userId}/${partnerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    if (partnerId) fetchMessages();
  }, [partnerId, userId]);

  // ⭐ Socket listener
  useEffect(() => {
    const handleIncoming = (msg) => {
      if (
        (msg.from === userId && msg.to === partnerId) ||
        (msg.from === partnerId && msg.to === userId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("privateMessage", handleIncoming);
    return () => socket.off("privateMessage", handleIncoming);
  }, [partnerId, userId]);

  // ⭐ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⭐ Send text message
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = {
      from: userId,
      to: partnerId,
      username,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // 1️⃣ Save to DB
    try {
      await axios.post(`${API_BASE}/api/chat/private`, msg, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }

    // 2️⃣ Emit via socket
    socket.emit("privateMessage", msg);

    setMessages((prev) => [...prev, msg]); // instant update
    setInput("");
  };

  // ⭐ Upload + send file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const sendFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const fileMsg = {
        from: userId,
        to: partnerId,
        username,
        fileUrl: res.data.fileUrl,
        timestamp: new Date().toISOString(),
      };

      // Save in DB
      await axios.post(`${API_BASE}/api/chat/private`, fileMsg, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Emit via socket
      socket.emit("privateMessage", fileMsg);

      setMessages((prev) => [...prev, fileMsg]);
      setFile(null);
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          fpsLimit: 60,
          background: { color: "#191931" },
          particles: {
            number: { value: 70, density: { enable: true, area: 800 } },
            color: { value: ["#62d6e8", "#9867f0", "#ffd166"] },
            shape: { type: "circle" },
            opacity: { value: 0.65, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 2, outModes: "bounce" },
            links: {
              enable: true,
              distance: 110,
              color: "#a3968e",
              opacity: 0.25,
              width: 2,
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh", zIndex: 10 }}
      >
        <Grid
          item
          xs={12}
          sm={9}
          md={7}
          lg={5}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "90vh" : "80vh",
            maxHeight: "98vh",
            minHeight: "420px",
            background: colors.chatBg,
            borderRadius: 5,
            boxShadow: "0 0 60px #04021390, 0 4px 52px #0f001099",
            position: "relative",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2.2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: colors.headerBg,
              borderRadius: "20px 20px 0 0",
            }}
          >
            <Avatar
              sx={{
                width: 54,
                height: 54,
                bgcolor: colors.attachBg,
                color: "#ffe577",
                fontWeight: 700,
              }}
            >
              {partner?.username
                ? partner.username.charAt(0).toUpperCase()
                : partnerId.charAt(0).toUpperCase()}
            </Avatar>
            <Typography
              variant="h5"
              color="#faffff"
              fontWeight={700}
              letterSpacing={1.5}
              sx={{ textShadow: "0 8px 32px #524af77a, 0 0 6px #6b7afd" }}
            >
              {partner?.username || "User"}
            </Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: "auto",
              bgcolor: "rgba(28,32,60, 0.77)",
              borderRadius: "0 0 20px 20px",
            }}
          >
            {loading ? (
              <Typography align="center" color="#babafd" sx={{ mt: 4 }}>
                Loading messages...
              </Typography>
            ) : messages.length === 0 ? (
              <Typography align="center" color="#babafd" sx={{ mt: 4 }}>
                No messages yet. Start chatting!
              </Typography>
            ) : (
              messages.map((msg, idx) => {
                const senderId = msg.from?._id || msg.from;
                const isSender = String(senderId) === String(userId);

                return (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: isSender ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        background: "rgba(30,32,55,0.96)",
                        color: "#e1e8fa",
                        px: 2.4,
                        py: 1.3,
                        borderRadius: "13px",
                        minWidth: 110,
                        maxWidth: "70%",
                        fontWeight: 500,
                        border: isSender
                          ? "1.5px solid #a07afd"
                          : "1.5px solid #222854",
                        overflowWrap: "break-word",
                      }}
                    >
                      <Typography
                        sx={{
                          color: isSender ? "#ffe57f" : "#22d6fc",
                          fontWeight: 700,
                          fontSize: 16,
                          mb: 0.3,
                        }}
                      >
                        {isSender ? "You" : msg.from?.username || msg.username}
                      </Typography>

                      {msg.content && (
                        <Typography sx={{ fontSize: 16, mb: 0.4 }}>
                          {msg.content}
                        </Typography>
                      )}

                      {msg.fileUrl && (
                        <a
                          href={`${API_BASE}${msg.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#ffe36c",
                            fontWeight: 700,
                            textDecoration: "underline",
                            wordBreak: "break-word",
                            fontSize: 16,
                          }}
                        >
                          {msg.fileUrl.split("/").pop()}
                        </a>
                      )}

                      <Typography
                        sx={{
                          color: "#a6b1dc",
                          opacity: 0.9,
                          pt: 0.7,
                          fontSize: 13.5,
                          textAlign: "right",
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Box
            sx={{
              p: 2.1,
              display: "flex",
              gap: 1,
              alignItems: "center",
              bgcolor: colors.toolbarBg,
              borderRadius: "0 0 20px 20px",
            }}
          >
            <IconButton component="label" sx={{ bgcolor: colors.attach }}>
              <AttachFileIcon />
              <input type="file" hidden onChange={handleFileChange} />
            </IconButton>
            <Button
              variant="contained"
              disabled={!file}
              onClick={sendFile}
              sx={{
                bgcolor: file ? colors.buttonBg : colors.buttonDisabled,
                color: colors.buttonText,
              }}
            >
              Send File
            </Button>
            <TextField
              fullWidth
              multiline
              maxRows={5}
              placeholder="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              sx={{
                bgcolor: colors.inputBg,
                border: `1.5px solid ${colors.inputBorder}`,
                borderRadius: 2,
                input: { color: colors.inputText },
              }}
            />
            <Button
              variant="contained"
              disabled={!input.trim()}
              onClick={sendMessage}
              sx={{
                bgcolor: input.trim() ? colors.buttonBg : colors.buttonDisabled,
                color: colors.buttonText,
              }}
            >
              Send
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PrivateChat;
