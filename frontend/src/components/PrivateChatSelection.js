import React, { useCallback } from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const API_BASE = process.env.REACT_APP_API_URL;

function PrivateChatSelection({ userId, onlineUsers }) {
  const navigate = useNavigate();

  // 3D palette particles background
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: '#191931',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        overflow: 'hidden'
      }}
    >
      {/* 3D Palette Particle BG */}
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
            move: { enable: true, speed: 2, outModes: 'bounce' },
            links: { enable: true, distance: 110, color: "#a3a3ff", opacity: 0.25, width: 2 }
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" } },
            modes: { repulse: { distance: 100 } }
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          width: { xs: '90%', sm: 400 },
          bgcolor: 'rgba(33, 33, 64, 0.95)',
          borderRadius: 4,
          boxShadow: '0 0 40px #7b5cf5cc',
          p: 4,
          color: '#fff',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 3, fontWeight: 700, letterSpacing: 1.2 }}
        >
          Select a user to chat with
        </Typography>
        {onlineUsers.length === 0 ? (
          <Typography align="center" sx={{ opacity: 0.7 }}>
            No users online.
          </Typography>
        ) : (
          onlineUsers
            .filter((u) => u.id !== userId)
            .map((user) => (
              <Button
                key={user.id}
                onClick={() => navigate(`/private/${user.id}`)}
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  mb: 2,
                  width: '100%',
                  fontWeight: 600,
                  color: '#e0e0ff',
                  borderColor: '#7b5cf5',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#7b5cf5',
                    color: '#fff',
                    borderColor: '#7b5cf5',
                  },
                }}
              >
                <Avatar
                  src={user.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : undefined}
                  sx={{
                    mr: 2,
                    bgcolor: '#7b5cf5',
                    fontWeight: 'bold',
                  }}
                >
                  {!user.profilePhoto && user.username.charAt(0).toUpperCase()}
                </Avatar>
                {user.username}
              </Button>
            ))
        )}
      </Box>
    </Box>
  );
}

export default PrivateChatSelection;
