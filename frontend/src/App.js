// import React, { useState, useEffect, useMemo } from 'react';
// import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import axios from 'axios';
// import { io } from 'socket.io-client';

// import Login from './components/Login';
// import Register from './components/Register';
// import LandingPage from './components/LandingPage';
// import TaskBar from './components/TaskBar';
// import Chat from './components/Chat';
// import PrivateChat from './components/PrivateChat';
// import PrivateChatSelection from './components/PrivateChatSelection';
// import Profile from './components/Profile';
// import Settings from './components/Settings';
// import HomePage from './components/HomePage';
// import RequestReset from "./components/RequestReset";
// import ResetPassword from "./components/ResetPassword";
// import GroupChatPage from './components/GroupChatPage';

// function App() {
//   // Safe localStorage parsing
//   const [user, setUser] = useState(() => {
//     try {
//       const stored = localStorage.getItem('user');
//       return stored ? JSON.parse(stored) : null;
//     } catch {
//       return null;
//     }
//   });

//   const [showRegister, setShowRegister] = useState(!user);
//   const [showLanding, setShowLanding] = useState(!user);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const [darkMode, setDarkMode] = useState(() => {
//     try {
//       const saved = localStorage.getItem('darkMode');
//       return saved ? JSON.parse(saved) : true;
//     } catch {
//       return true;
//     }
//   });

//   const theme = useMemo(() =>
//     createTheme({
//       palette: {
//         mode: darkMode ? 'dark' : 'light',
//         primary: { main: '#7b5cf5' },
//         secondary: { main: '#9562e2' },
//       }
//     }),
//     [darkMode]
//   );

//   const [socket, setSocket] = useState(null);

//   // Initialize socket when user logs in
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       const newSocket = io('http://localhost:5000', { auth: { token } });
//       setSocket(newSocket);

//       newSocket.emit('requestOnlineUsers');
//       newSocket.on('onlineUsers', setOnlineUsers);

//       return () => newSocket.disconnect();
//     }
//   }, [user]);

//   // Fetch user info on app load if token exists
//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         const res = await axios.get("http://localhost:5000/api/auth/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(res.data);
//         localStorage.setItem('user', JSON.stringify(res.data));
//       } catch {
//         handleLogout();
//       }
//     };
//     fetchUser();
//   }, []);

//   const handleUserAuth = (responseData) => {
//     const { token, user } = responseData;
//     if (!token || !user) return;

//     setUser(user);
//     localStorage.setItem('user', JSON.stringify(user));
//     localStorage.setItem('token', token);
//     setShowLanding(false);
//     setShowRegister(false);
//   };

//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     setShowLanding(true);
//     if (socket) socket.disconnect();
//   };

//   const handleLandingLoginClick = () => setShowLanding(false);
//   const handleLandingRegisterClick = () => setShowLanding(false) && setShowRegister(true);

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <BrowserRouter>
//         {!user ? (
//           <Routes>
//             <Route path="/" element={
//               showLanding ? (
//                 <LandingPage 
//                   onLoginClick={handleLandingLoginClick} 
//                   onRegisterClick={handleLandingRegisterClick} 
//                 />
//               ) : showRegister ? (
//                 <Register 
//                   onRegister={handleUserAuth} 
//                   onSwitchToLogin={() => setShowRegister(false)} 
//                 />
//               ) : (
//                 <Login 
//                   onLogin={handleUserAuth} 
//                   onSwitchToRegister={() => setShowRegister(true)} 
//                 />
//               )
//             }/>
//             <Route path="/forgot-password" element={<RequestReset />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         ) : (
//           <>
//             <TaskBar
//               username={user.username}
//               profilePhoto={user.profilePhoto}
//               onLogout={handleLogout}
//             />
//             <Box sx={{ pt: '64px' }}>
//               <Routes>
//                 <Route path="/" element={<HomePage user={user} onlineUsers={onlineUsers} />} />
//                 <Route path="/group" element={<Chat userId={user.id || user._id} username={user.username} />} />
//                 <Route path="/private/select" element={<PrivateChatSelection userId={user.id || user._id} onlineUsers={onlineUsers} />} />
//                 <Route path="/private/:userId" element={<PrivateChat userId={user.id || user._id} username={user.username} />} />
//                 <Route path="/profile" element={<Profile userId={user.id || user._id} username={user.username} />} />
//                 <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
//                 <Route path="/groups" element={<GroupChatPage currentUserId={user.id || user._id} />} />
//                 <Route path="*" element={<Navigate to="/group" replace />} />
//               </Routes>
//             </Box>
//           </>
//         )}
//       </BrowserRouter>
//     </ThemeProvider>
//   );
// }

// export default App;


import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import TaskBar from './components/TaskBar';
import Chat from './components/Chat';
import PrivateChat from './components/PrivateChat';
import PrivateChatSelection from './components/PrivateChatSelection';
import Profile from './components/Profile';
import Settings from './components/Settings';
import HomePage from './components/HomePage';
import RequestReset from "./components/RequestReset";
import ResetPassword from "./components/ResetPassword";
import GroupChatPage from './components/GroupChatPage';
import { io } from 'socket.io-client';

const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', { auth: { token } });

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [showRegister, setShowRegister] = useState(!user);
  const [showLanding, setShowLanding] = useState(!user);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: '#7b5cf5' },
        secondary: { main: '#9562e2' },
      }
    }),
    [darkMode]
  );

  useEffect(() => {
    if (user) {
      socket.emit('requestOnlineUsers');
    }

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('onlineUsers');
    };
  }, [user]);

  const handleUserAuth = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLanding(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowLanding(true);
  };

  const handleLandingLoginClick = () => {
    setShowLanding(false);
    setShowRegister(false);
  };

  const handleLandingRegisterClick = () => {
    setShowLanding(false);
    setShowRegister(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {!user ? (
          <Routes>
            <Route path="/" element={
              showLanding ? (
                <LandingPage 
                  onLoginClick={handleLandingLoginClick} 
                  onRegisterClick={handleLandingRegisterClick} 
                />
              ) : showRegister ? (
                <Register 
                  onRegister={handleUserAuth} 
                  onSwitchToLogin={() => setShowRegister(false)} 
                />
              ) : (
                <Login 
                  onLogin={handleUserAuth} 
                  onSwitchToRegister={() => setShowRegister(true)} 
                />
              )
            } />
            <Route path="/forgot-password" element={<RequestReset />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Redirect unknown unauthenticated routes to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <>
            <TaskBar
              username={user.username}
              profilePhoto={user.profilePhoto}
              onLogout={handleLogout}
            />
            <Box sx={{ pt: '64px' }}>
              <Routes>
                <Route path="/" element={<HomePage user={user} onlineUsers={onlineUsers} />} />
                <Route path="/group" element={<Chat userId={user.id} username={user.username} />} />
                <Route path="/private/select" element={<PrivateChatSelection userId={user.id} onlineUsers={onlineUsers} />} />
                <Route path="/private/:userId" element={<PrivateChat userId={user.id} username={user.username} />} />
                <Route path="/profile" element={<Profile userId={user.id} username={user.username} />} />
                <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
                <Route path="/groups" element={<GroupChatPage currentUserId={user.id || user._id} />} />
                <Route path="*" element={<Navigate to="/group" replace />} />
              </Routes>
            </Box>
          </>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

