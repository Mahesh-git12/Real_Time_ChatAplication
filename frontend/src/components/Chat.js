import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Box,
} from "@mui/material";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import socket from "../socket";
import axios from "axios";

// ADD THIS LINE:
const API_BASE = process.env.REACT_APP_API_URL;

const COLORS = ["#a377fc", "#43e8d8", "#ff68a7", "#ffe156", "#7afcff", "#ffb38e"];
function getColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

const CHAT_WIDTH = 520;

const GroupChatPage = ({ currentUserId, currentUsername, currentUserPhoto }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const chatEndRef = useRef(null);

  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    function handleOnlineUsers(users) {
      setOnlineUsers(users.filter((u) => u.id !== currentUserId));
    }
    socket.on("onlineUsers", handleOnlineUsers);
    socket.emit("joinGroups");
    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [currentUserId]);

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUsers([]);
    setGroupName("");
  };

  // CHANGE: Use API_BASE in axios calls
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0)
      return alert("Provide name and select members");
    const memberIds = selectedUsers.map(String);
    try {
      const res = await axios.post(
        `${API_BASE}/api/group/create`,
        { name: groupName, members: memberIds },
        { headers: authHeader }
      );
      setGroups((prev) => [res.data, ...prev]);
      closeDialog();
    } catch (err) {
      alert("Error creating group");
    }
  };

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API_BASE}/api/group`, { headers: authHeader })
      .then((res) => {
        if (mounted) setGroups(res.data);
      })
      .catch(() => {
        axios
          .get(`${API_BASE}/api/group/user/${currentUserId}`, { headers: authHeader })
          .then((r) => {
            if (mounted) setGroups(r.data);
          })
          .catch(() => {});
      });
    return () => (mounted = false);
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedGroup) return setMessages([]);
    socket.emit("joinGroup", selectedGroup._id);
    axios
      .get(`${API_BASE}/api/group/${selectedGroup._id}/messages`, { headers: authHeader })
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));
    return () => socket.emit("leaveGroup", selectedGroup._id);
  }, [selectedGroup]);

  useEffect(() => {
    function handleGroupMessage(msg) {
      if (
        msg.groupId === selectedGroup?._id ||
        String(msg.group) === String(selectedGroup?._id)
      ) {
        setMessages((prev) => [
          ...prev,
          {
            _id: msg._id || Math.random().toString(36).slice(2),
            sender: msg.sender || msg.senderId,
            message: msg.message,
            createdAt: msg.createdAt || new Date(),
          },
        ]);
      }
    }
    socket.on("groupMessage", handleGroupMessage);
    return () => socket.off("groupMessage", handleGroupMessage);
  }, [selectedGroup]);

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !selectedGroup) return;
    socket.emit("groupMessage", {
      groupId: selectedGroup._id,
      message: input.trim(),
    });
    setInput("");
  };

  function formatTime(when) {
    return new Date(when).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const handleDeleteGroup = async () => {
    if (window.confirm("Delete group and ALL its messages?")) {
      await axios.delete(`${API_BASE}/api/group/${selectedGroup._id}`, {
        headers: authHeader,
      });
      setGroups(groups.filter((g) => g._id !== selectedGroup._id));
      setSelectedGroup(null);
    }
  };
  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to exit this group?")) {
      await axios.post(
        `${API_BASE}/api/group/${selectedGroup._id}/leave`,
        {},
        { headers: authHeader }
      );
      setGroups(groups.filter((g) => g._id !== selectedGroup._id));
      setSelectedGroup(null);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        fontFamily: "'Poppins',sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BG Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "#191931" } },
          fpsLimit: 60,
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
              color: "#a3a3ff",
              opacity: 0.25,
              width: 2,
            },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" } },
            modes: { repulse: { distance: 100 } },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 0,
        }}
      />

      {/* SIDEBAR */}
      <Box
        width={260}
        bgcolor="#130f25"
        sx={{
          borderRight: "2px solid #27175c",
          py: 2,
          px: 1,
          zIndex: 2,
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h2
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: 23,
              color: "#b68bff",
            }}
          >
            Group Chats
          </h2>
          <Button
            onClick={openDialog}
            variant="contained"
            sx={{ mt: 2, mb: 2, bgcolor: "#7d5fff", width: "100%" }}
          >
            + CREATE
          </Button>
        </div>
        <div style={{ padding: "0 5px" }}>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {groups.map((g) => (
              <li
                key={g._id}
                onClick={() => setSelectedGroup(g)}
                style={{
                  fontWeight: selectedGroup?._id === g._id ? "bold" : 500,
                  background:
                    selectedGroup?._id === g._id ? "#22193c" : undefined,
                  borderRadius: 8,
                  marginBottom: 2,
                  padding: "9px 13px",
                  cursor: "pointer",
                }}
              >
                #{g.name}
              </li>
            ))}
          </ul>
        </div>
      </Box>

      {/* CHAT PANEL */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: 0, zIndex: 2, position: "relative" }}
      >
        {selectedGroup ? (
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            maxWidth={CHAT_WIDTH}
            height="78vh"
            minHeight={480}
            overflow="hidden"
            sx={{
              background:
                "linear-gradient(120deg, #221941e6 60%, #1b1838e0 100%)",
              borderRadius: 16,
              boxShadow: "0 8px 42px 0 #0002",
              mt: 3,
              mb: 3,
              zIndex: 3,
            }}
          >
            {/* Group Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 2,
                background: "transparent",
                borderBottom: "1px solid #27175c",
                borderRadius: "16px 16px 0 0",
                minHeight: 56,
              }}
            >
              {/* Left: Group name and members */}
              <Box flex={1} minWidth={0} sx={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 22,
                    color: "#d4bcff",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    marginBottom: 1,
                  }}
                >
                  {selectedGroup.name}
                </div>
                <div style={{ color: "#bdb9d1", fontSize: 13, fontWeight: 500 }}>
                  Members: {selectedGroup.members?.length || 0}
                </div>
              </Box>
              {/* Right: Exit/Delete button */}
              <Box pl={2} flexShrink={0}>
                {(selectedGroup?.creator && selectedGroup?.creator._id
                  ? String(selectedGroup?.creator._id)
                  : String(selectedGroup?.creator)) === String(currentUserId)
                ? (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleDeleteGroup}
                    sx={{
                      fontWeight: 800,
                      px: 2.5,
                      borderRadius: 2,
                      letterSpacing: 1,
                      color: "#ff93a3",
                      borderColor: "#ff93a3"
                    }}
                  >
                    DELETE
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    color="warning"
                    onClick={handleLeaveGroup}
                    sx={{
                      fontWeight: 800,
                      px: 3,
                      borderRadius: 2,
                      letterSpacing: 1,
                      color: "#ebae53",
                      borderColor: "#ebae53"
                    }}
                  >
                    EXIT
                  </Button>
                )}
              </Box>
            </Box>

            {/* Messages */}
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              style={{
                overflowY: "auto",
                minHeight: 0,
                margin: "0 18px",
                background: "inherit",
              }}
            >
              {messages.map((m, idx) => {
                const senderId = m.sender?._id
                  ? String(m.sender._id)
                  : m.sender?.id
                  ? String(m.sender.id)
                  : String(m.sender);
                const senderName = m.sender?.username || currentUsername;
                const isCurrentUser = senderId === String(currentUserId);

                return (
                  <Box
                    key={idx}
                    display="flex"
                    justifyContent={
                      isCurrentUser ? "flex-end" : "flex-start"
                    }
                    width="100%"
                    mb={1.5}
                  >
                    <Box
                      display="flex"
                      flexDirection={
                        isCurrentUser ? "row-reverse" : "row"
                      }
                      alignItems="flex-end"
                      maxWidth="75%"
                    >
                      {/* Avatar */}
                      <Avatar
                        src={isCurrentUser ? currentUserPhoto : ""}
                        sx={{
                          width: 34,
                          height: 34,
                          fontSize: 15,
                          ml: isCurrentUser ? 1 : 0,
                          mr: !isCurrentUser ? 1 : 0,
                          bgcolor: isCurrentUser
                            ? "#7d5fff"
                            : getColor(senderName),
                        }}
                      >
                        {(
                          isCurrentUser ? currentUsername : senderName
                        )
                          ?.charAt(0)
                          .toUpperCase()}
                      </Avatar>

                      {/* Message bubble */}
                      <Box
                        sx={{
                          background: "#191931",
                          color: "#dbeafe",
                          borderRadius: 7,
                          px: 2,
                          py: 1,
                          fontSize: 16,
                          maxWidth: 340,
                          wordBreak: "break-word",
                          boxShadow:
                            "0 2px 14px 0 #0a152cbb",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: isCurrentUser
                              ? "#ffd166"
                              : "#62d6e8",
                            fontSize: 15,
                            marginBottom: 3,
                          }}
                        >
                          {isCurrentUser ? "You" : senderName}
                        </div>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {m.message}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#b8bfff",
                            marginTop: 3,
                            textAlign: "right",
                            opacity: 0.7,
                          }}
                        >
                          {m.createdAt ? formatTime(m.createdAt) : ""}
                        </div>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              <div ref={chatEndRef} />
            </Box>

            {/* Input */}
            <Box
              p={2}
              bgcolor="transparent"
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={1}
              style={{ width: "98%", maxWidth: 420, margin: "0 auto" }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 17,
                  background: "#211b32",
                  color: "#fff",
                  outline: "none",
                  marginRight: 8,
                  fontFamily: "inherit",
                }}
              />
              <Button
                onClick={sendMessage}
                variant="contained"
                sx={{
                  height: 48,
                  px: 3.5,
                  borderRadius: 8,
                  fontWeight: 700,
                  ml: 1.5,
                  bgcolor: "#7d5fff",
                }}
              >
                SEND
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <p
              style={{
                color: "#aaa",
                fontSize: 23,
                fontWeight: 500,
                background: "rgba(39,25,79,0.12)",
                padding: 28,
                borderRadius: 14,
              }}
            >
              Select a group to view and send messages.
            </p>
          </Box>
        )}
      </Box>

      {/* Create Group Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        PaperProps={{
          style: {
            background: "#1a152e",
            color: "#fff",
            borderRadius: 16,
            minWidth: 385,
          },
        }}
      >
        <DialogTitle sx={{ color: "#eee" }}>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={groupName}
            variant="outlined"
            onChange={(e) => setGroupName(e.target.value)}
            sx={{
              mb: 2,
              input: { color: "#eee" },
              label: { color: "#ccc" },
            }}
          />
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#caacfc",
              }}
            >
              Select online users:
            </div>
            {onlineUsers.length === 0 && (
              <div style={{ color: "#bbb" }}>No other users online.</div>
            )}
            {onlineUsers.map((user) => (
              <label
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "7px 0",
                  fontSize: 15,
                }}
              >
                <Avatar
                  src={user.profilePhoto}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 13,
                    bgcolor: getColor(user.username),
                    mr: 1,
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <input
                  type="checkbox"
                  value={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedUsers([...selectedUsers, user.id]);
                    else
                      setSelectedUsers(
                        selectedUsers.filter((id) => id !== user.id)
                      );
                  }}
                  style={{ marginRight: 7 }}
                />
                {user.username}
              </label>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} sx={{ color: "#b392f7" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            sx={{ bgcolor: "#7d5fff" }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupChatPage;
