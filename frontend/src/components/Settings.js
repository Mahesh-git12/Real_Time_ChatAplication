import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import ChangePassword from "./ChangePassword";

function Settings() {
  const particlesOptions = {
    fullScreen: { enable: false },
    background: { color: "#191931" },
    fpsLimit: 60,
    particles: {
      number: { value: 80, density: { enable: true, area: 1200 } },
      color: { value: ["#6b7afd", "#62d6e8", "#ffd166"] },
      shape: { type: "circle" },
      opacity: { value: 0.55 },
      size: { value: 3.2, random: true },
      move: { enable: true, speed: 1.2, outModes: "bounce" },
      links: {
        enable: true,
        distance: 120,
        color: "#9562e2",
        opacity: 0.14,
        width: 2,
      },
    },
    detectRetina: true,
  };

  return (
    <Box
      sx={{
        height: "100vh",           // fixed viewport height
        width: "100vw",
        overflow: "hidden",        // no page scroll
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#191931",
        px: 2,
      }}
    >
      <Particles
        id="tsparticles"
        init={loadFull}
        options={particlesOptions}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 0,
        }}
      />

      <Paper
        elevation={12}
        sx={{
          maxWidth: 340,
          maxHeight: "90vh",    // card can't exceed 90% viewport height
          overflowY: "auto",    // scroll inside card for overflow
          borderRadius: 4,
          bgcolor: "rgba(33, 33, 64, 0.89)",
          boxShadow: "0 0 40px 6px #7b5cf540",
          px: { xs: 2, sm: 3 },
          py: 4,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            background: "linear-gradient(90deg,#6b7afd,#ffd166 60%,#62d6e8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
            letterSpacing: 0.7,
          }}
        >
          Settings
        </Typography>

        <Box sx={{ width: "100%" }}>
          <Typography variant="subtitle1" fontWeight={700} textAlign="center" mb={1}>
            Change Password
          </Typography>
          <ChangePassword />
        </Box>

        <Divider sx={{ width: "100%", borderColor: "#7b5cf533", mt: 3 }} />

        <Typography
          variant="caption"
          sx={{ opacity: 0.6, display: "block", textAlign: "center" }}
        >
          More options coming soon: Privacy settings, notifications, account deletion.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Settings;
