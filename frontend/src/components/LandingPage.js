import React, { useCallback } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: 0 },
          background: { color: { value: "#0a192f" } },
          fpsLimit: 60,
          particles: {
            number: { value: 70, density: { enable: true, area: 800 } },
            color: { value: "#50E3C2" },
            shape: { type: "circle" },
            opacity: {
              value: 0.5,
              random: { enable: true, minimumValue: 0.1 }
            },
            size: {
              value: 3,
              random: { enable: true, minimumValue: 1 }
            },
            move: {
              enable: true,
              speed: 2.5,
              direction: "none",
              random: false,
              straight: false,
              outModes: "out"
            },
            links: {
              enable: true,
              distance: 140,
              color: "#50E3C2",
              opacity: 0.35,
              width: 1
            }
          },
          detectRetina: true,
        }}
      />

      <Paper
        elevation={12}
        sx={{
          position: 'absolute',
          top: '25%',
          left: 0,
          right: 0,
          margin: 'auto',
          maxWidth: 460,
          p: 5,
          bgcolor: 'rgba(30, 50, 70, 0.85)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 15px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3, color: '#50E3C2' }}>
          YapZone
        </Typography>
        <Typography variant="body1" sx={{ mb: 5, color: '#A0C8F0', fontSize: 19 }}>
          The modern realtime chat application to connect and communicate seamlessly.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={onLoginClick}
          sx={{ mb: 3, py: 1.3, fontWeight: 'bold' }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={onRegisterClick}
          sx={{ fontWeight: 'bold', py: 1.3, borderColor: '#50E3C2', color: '#50E3C2' }}
        >
          Register
        </Button>
      </Paper>
    </Box>
  );
};

export default LandingPage;

// import React, { useCallback } from 'react';
// import { Box, Button, Typography, Paper } from '@mui/material';
// import Particles from 'react-tsparticles';
// import { loadFull } from 'tsparticles';

// const LandingPage = ({ onLoginClick, onRegisterClick }) => {
//   const particlesInit = useCallback(async (engine) => {
//     await loadFull(engine);
//   }, []);

//   return (
//     <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
//       <Particles
//         id="tsparticles"
//         init={particlesInit}
//         options={{
//           fullScreen: { enable: true, zIndex: 0 },
//           background: { color: { value: "#0a192f" } },
//           fpsLimit: 60,
//           particles: {
//             number: { value: 70, density: { enable: true, area: 800 } },
//             color: { value: "#50E3C2" },
//             shape: { type: "circle" },
//             opacity: {
//               value: 0.5,
//               random: { enable: true, minimumValue: 0.1 }
//             },
//             size: {
//               value: 3,
//               random: { enable: true, minimumValue: 1 }
//             },
//             move: {
//               enable: true,
//               speed: 2.5,
//               direction: "none",
//               random: false,
//               straight: false,
//               outModes: "out"
//             },
//             links: {
//               enable: true,
//               distance: 140,
//               color: "#50E3C2",
//               opacity: 0.35,
//               width: 1
//             }
//           },
//           detectRetina: true,
//         }}
//       />

//       <Paper
//         elevation={12}
//         sx={{
//           position: 'relative',
//           zIndex: 1,
//           p: 5,
//           maxWidth: 460,
//           mx: 'auto',
//           top: '25%',
//           bgcolor: 'rgba(30, 50, 70, 0.85)',
//           color: 'white',
//           borderRadius: 4,
//           boxShadow: '0 15px 60px rgba(0,0,0,0.6)',
//           backdropFilter: 'blur(12px)',
//           textAlign: 'center',
//           position: 'absolute',
//           left: 0,
//           right: 0,
//           margin: 'auto',
//         }}
//       >
//         <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3, color: '#50E3C2' }}>
//           ChatMaster
//         </Typography>
//         <Typography variant="body1" sx={{ mb: 5, color: '#A0C8F0', fontSize: 19 }}>
//           The modern realtime chat application to connect and communicate seamlessly.
//         </Typography>
//         <Button
//           variant="contained"
//           color="secondary"
//           fullWidth
//           onClick={onLoginClick}
//           sx={{ mb: 3, py: 1.3, fontWeight: 'bold' }}
//         >
//           Login
//         </Button>
//         <Button
//           variant="outlined"
//           color="secondary"
//           fullWidth
//           onClick={onRegisterClick}
//           sx={{ fontWeight: 'bold', py: 1.3, borderColor: '#50E3C2', color: '#50E3C2' }}
//         >
//           Register
//         </Button>
//       </Paper>
//     </Box>
//   );
// };

// export default LandingPage;
