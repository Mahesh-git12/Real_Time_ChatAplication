import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const Background3D = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: '#191931',
          zIndex: 0,
        }}
      />
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          fpsLimit: 60,
          particles: {
            number: { value: 70, density: { enable: true, area: 800 } },
            color: { value: ['#62d6e8', '#9867f0', '#ffd166'] },
            shape: { type: 'circle' },
            opacity: { value: 0.65, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 2, outModes: 'bounce' },
            links: {
              enable: true,
              distance: 110,
              color: '#a3a3ff',
              opacity: 0.25,
              width: 2,
            },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 100 } },
          },
          detectRetina: true,
        }}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

export default Background3D;
