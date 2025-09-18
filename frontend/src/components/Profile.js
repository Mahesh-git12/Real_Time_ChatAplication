import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import axios from "axios";

function UserProfile({ userId }) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Particle background init using dark color like other pages
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Dark particles config to match other pages (not white bg)
  const particlesOptions = {
    fullScreen: { enable: false },
    fpsLimit: 60,
    background: { color: "#191931" },
    particles: {
      number: { value: 80, density: { enable: true, area: 900 } },
      color: { value: ["#6b7afd", "#62d6e8", "#ffd166"] },
      shape: { type: "circle" },
      opacity: { value: 0.65, random: true },
      size: { value: 3.5, random: true },
      move: { enable: true, speed: 1.5, outModes: "bounce" },
      links: {
        enable: true,
        distance: 130,
        color: "#8b8de8",
        opacity: 0.15,
        width: 2,
      },
    },
    detectRetina: true,
  };

  // Fetch user data on mount or userId change
  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      setLoadingUser(true);
      setError(null);
      try {
        const res = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) {
          setUser(res.data);
          setEditUsername(res.data.username || "");
          setEditStatus(res.data.status || "");
        }
      } catch (err) {
        if (mounted) setError("Failed to load user data.");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    if (userId) fetchUser();
    return () => {
      mounted = false;
    };
  }, [userId, token]);

  // Handle profile photo upload with detailed error logging
  const handleProfilePhotoChange = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = await axios.patch(
        `/api/users/${userId}`,
        { profilePhoto: res.data.fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(updatedUser.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Profile photo upload failed. Check backend and logs."
      );
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Save username & status updates
  const handleProfileSave = async () => {
    if (!editUsername.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updatedUser = await axios.patch(
        `/api/users/${userId}`,
        { username: editUsername.trim(), status: editStatus.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(updatedUser.data);
      alert("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Profile update failed. Please try again."
      );
      console.error("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          maxWidth: 450,
          mx: "auto",
          mt: 8,
          p: 4,
          borderRadius: 4,
          bgcolor: "#212140",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 0 35px #7459f7cc",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loadingUser ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Avatar
                src={user?.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : ""}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  bgcolor: "#746bfd",
                  mx: "auto",
                  mb: 1,
                  border: "3px solid #ffc85785",
                }}
              >
                {!user?.profilePhoto && (user?.username ? user.username[0].toUpperCase() : "?")}
              </Avatar>
              <Button
                variant="contained"
                component="label"
                disabled={uploading}
                sx={{
                  bgcolor: "#7b59f7",
                  "&:hover": { bgcolor: "#9f7cff" },
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  mt: 1,
                }}
              >
                {uploading ? <CircularProgress size={25} color="inherit" /> : "Upload Profile Photo"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                />
              </Button>
            </Box>

            <TextField
              label="Username"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              fullWidth
              autoFocus
              disabled={saving}
              sx={{
                mb: 3,
                bgcolor: "#252355",
                input: { color: "#fff" },
                label: { color: "#b4bdea" },
                borderRadius: 2,
              }}
            />

            <TextField
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              fullWidth
              disabled={saving}
              sx={{
                mb: 4,
                bgcolor: "#252355",
                input: { color: "#fff" },
                label: { color: "#b4bdea" },
                borderRadius: 2,
              }}
            />

            <Button
              variant="contained"
              color="primary"
              disabled={saving || !editUsername.trim()}
              onClick={handleProfileSave}
              sx={{
                fontWeight: 700,
                py: 1.3,
                px: 6,
                borderRadius: 3,
                boxShadow: "0 0 12px #5ad4fb",
                "&:hover": { bgcolor: "#3ac1fb" },
              }}
            >
              {saving ? <CircularProgress size={26} color="inherit" /> : "Save Profile"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

export default UserProfile;


// import React from 'react';
// import { Box, Typography, Avatar, Paper, Divider, Button } from '@mui/material';
// import Background3D from './Background3D';

// function Profile({ userId, username }) {
//   return (
//     <>
//       <Background3D />
//       <Box
//         sx={{
//           position: 'relative',
//           minHeight: 'calc(100vh - 64px)',
//           zIndex: 1,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           pt: 0,
//         }}
//       >
//         <Paper
//           elevation={12}
//           sx={{
//             p: 6,
//             borderRadius: 5,
//             maxWidth: 400,
//             minWidth: 340,
//             textAlign: 'center',
//             bgcolor: 'rgba(39, 27, 81, 0.85)',
//             color: '#e0e7ff',
//             boxShadow: '0 6px 38px #7f5af0a0',
//           }}
//         >
//           <Avatar
//             sx={{
//               bgcolor: '#7b5cf5',
//               width: 90,
//               height: 90,
//               fontSize: 38,
//               mb: 2,
//               mx: 'auto',
//               boxShadow: '0 2px 24px #7b5cf588'
//             }}
//           >
//             {username.charAt(0).toUpperCase()}
//           </Avatar>
//           <Typography variant="h5" fontWeight={700} gutterBottom>
//             {username}
//           </Typography>
//           <Divider sx={{ my: 2, bgcolor: '#8164e7' }} />
//           <Typography variant="body2" sx={{ opacity: 0.8 }}>
//             <strong>User ID:</strong> {userId}
//           </Typography>
//           <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
//             Welcome to your profile!  
//             You can update your display name, set a custom status, or add a profile picture here in future releases.
//           </Typography>
//           <Button variant="contained" color="secondary" sx={{ mt: 2, p: 1 }}>
//             Edit Profile (Coming Soon)
//           </Button>
//         </Paper>
//       </Box>
//     </>
//   );
// }

// export default Profile;
