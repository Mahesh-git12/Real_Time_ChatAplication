// import React, { useState, useCallback } from 'react';
// import {
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Alert,
//   CircularProgress,
//   Link,
//   Paper,
// } from '@mui/material';
// import { Link as RouterLink } from 'react-router-dom';
// import Particles from 'react-tsparticles';
// import { loadFull } from 'tsparticles';
// import axios from 'axios';

// function Login({ onLogin, onSwitchToRegister }) {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleLogin = async e => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/login', form);
//       localStorage.setItem('token', res.data.token);

//       // Use the user object directly from backend
//       onLogin(res.data.user);

//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Invalid credentials');
//     } finally {
//       setLoading(false);
//     }
//   };

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
//             number: { value: 50, density: { enable: true, area: 800 } },
//             color: { value: "#50E3C2" },
//             shape: { type: "circle" },
//             opacity: { value: 0.5, random: { enable: true, minimumValue: 0.1 } },
//             size: { value: 3, random: { enable: true, minimumValue: 1 } },
//             move: { enable: true, speed: 2, outModes: "out" },
//             links: { enable: true, distance: 150, color: "#50E3C2", opacity: 0.4, width: 1 }
//           },
//           detectRetina: true,
//         }}
//       />

//       <Paper
//         elevation={10}
//         sx={{
//           position: 'relative',
//           zIndex: 1,
//           maxWidth: 450,
//           mx: 'auto',
//           mt: 10,
//           p: 6,
//           bgcolor: 'rgba(30, 50, 70, 0.85)',
//           color: 'white',
//           borderRadius: 4,
//           boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
//           backdropFilter: 'blur(10px)',
//         }}
//       >
//         <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
//           Login
//         </Typography>
//         {message && (
//           <Alert severity="error" sx={{ mb: 3, fontWeight: 'bold' }}>
//             {message}
//           </Alert>
//         )}
//         <form onSubmit={handleLogin} style={{ marginBottom: '12px' }}>
//           <TextField
//             type="email"
//             name="email"
//             label="Email"
//             fullWidth
//             required
//             margin="normal"
//             value={form.email}
//             onChange={handleChange}
//             autoFocus
//             variant="filled"
//             InputLabelProps={{ style: { color: '#A0C8F0' } }}
//             sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, input: { color: 'white' } }}
//           />
//           <TextField
//             type="password"
//             name="password"
//             label="Password"
//             fullWidth
//             required
//             margin="normal"
//             value={form.password}
//             onChange={handleChange}
//             variant="filled"
//             InputLabelProps={{ style: { color: '#A0C8F0' } }}
//             sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, input: { color: 'white' } }}
//           />
//           <Button
//             type="submit"
//             variant="contained"
//             color="secondary"
//             fullWidth
//             disabled={loading}
//             sx={{ mt: 4, py: 1.2, fontWeight: 'bold' }}
//           >
//             {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
//           </Button>
//         </form>
//         <Typography
//           mt={1}
//           align="center"
//           color="lightblue"
//           sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}
//         >
//           <span>Don't have an account?</span>
//           <Link href="#" onClick={e => { e.preventDefault(); onSwitchToRegister(); }} underline="hover" color="inherit" sx={{ cursor: 'pointer' }}>
//             Register here
//           </Link>
//           <span>|</span>
//           <Link component={RouterLink} to="/forgot-password" underline="hover" color="inherit" sx={{ cursor: "pointer" }}>
//             Forgot Password?
//           </Link>
//         </Typography>
//       </Paper>
//     </Box>
//   );
// }

// export default Login;

import React, { useState, useCallback } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Paper,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

function Login({ onLogin, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      const user = jwtDecode(res.data.token);
      onLogin({ username: user.username || user.id, id: user.id });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

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
            number: { value: 50, density: { enable: true, area: 800 } },
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
              speed: 2,
              direction: "none",
              random: false,
              straight: false,
              outModes: "out"
            },
            links: {
              enable: true,
              distance: 150,
              color: "#50E3C2",
              opacity: 0.4,
              width: 1
            }
          },
          detectRetina: true,
        }}
      />

      <Paper
        elevation={10}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 450,
          mx: 'auto',
          mt: 10,
          p: 6,
          bgcolor: 'rgba(30, 50, 70, 0.85)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          Login
        </Typography>
        {message && (
          <Alert severity="error" sx={{ mb: 3, fontWeight: 'bold' }}>
            {message}
          </Alert>
        )}
        <form onSubmit={handleLogin} style={{ marginBottom: '12px' }}>
          <TextField
            type="email"
            name="email"
            label="Email"
            fullWidth
            required
            margin="normal"
            value={form.email}
            onChange={handleChange}
            autoFocus
            variant="filled"
            InputLabelProps={{ style: { color: '#A0C8F0' } }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              input: { color: 'white' }
            }}
          />
          <TextField
            type="password"
            name="password"
            label="Password"
            fullWidth
            required
            margin="normal"
            value={form.password}
            onChange={handleChange}
            variant="filled"
            InputLabelProps={{ style: { color: '#A0C8F0' } }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              input: { color: 'white' }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            disabled={loading}
            sx={{ mt: 4, py: 1.2, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
        <Typography
          mt={1}
          align="center"
          color="lightblue"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <span>Don't have an account?</span>
          <Link
            href="#"
            onClick={e => {
              e.preventDefault();
              onSwitchToRegister();
            }}
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
          >
            Register here
          </Link>
          <span>|</span>
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
          >
            Forgot Password?
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
