import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Grid,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import io from 'socket.io-client';
import axios from 'axios';

const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', { auth: { token } });

function Chat({ userId, username }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Fetch all chat messages once at mount
  useEffect(() => {
    if (!token) return;
    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, []);

  // Socket events setup
  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (msg) =>
            msg.content === data.content &&
            new Date(msg.timestamp).getTime() === new Date(data.timestamp).getTime() &&
            msg.userId === data.userId
        );
        if (isDuplicate) return prev;
        return [...prev, data];
      });
    });

    socket.on('typing', (data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username) && data.username !== username) {
          return [...prev, data.username];
        }
        return prev;
      });
    });

    socket.on('stopTyping', (data) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.username));
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('chatMessage');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('onlineUsers');
    };
  }, [username]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    socket.emit('typing', { username });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { username });
    }, 1500);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const fileMessage = {
        userId,
        username,
        content: '',
        fileUrl: res.data.fileUrl,
        timestamp: new Date().toISOString(),
      };

      socket.emit('chatMessage', fileMessage);
      setFile(null);
    } catch (err) {
      console.error('File upload failed', err);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const messageData = {
      userId,
      username,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit('chatMessage', messageData);
    setMessage('');
    socket.emit('stopTyping', { username });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Particle background for style */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          background: { color: { value: "#191931" } },
          fpsLimit: 60,
          particles: {
            number: { value: 70, density: { enable: true, area: 800 } },
            color: { value: ["#62d6e8", "#9867f0", "#ffd166"] },
            shape: { type: "circle" },
            opacity: { value: 0.65, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 2, outModes: 'bounce' },
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
      />

      <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <Grid item xs={12} md={10} lg={8}>
          <Paper
            elevation={24}
            sx={{
              display: 'flex',
              p: 0,
              borderRadius: 4,
              height: isMobile ? '94vh' : 620,
              minHeight: isMobile ? 'auto' : 620,
              maxHeight: 700,
              bgcolor: 'rgba(28,30,43,0.97)',
              overflow: 'hidden',
              boxShadow: '0 6px 48px #000a',
            }}
          >
            {/* Sidebar */}
            <Box
              sx={{
                width: { xs: 120, sm: 190 },
                flexShrink: 0,
                bgcolor: '#222849',
                py: 3,
                px: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRight: '2px solid #373e69',
                minHeight: '100%',
              }}
            >
              <Typography variant="h6" sx={{ color: '#cbbcff', mb: 2, letterSpacing: 1 }}>
                Online Users
              </Typography>
              {onlineUsers.length === 0 ? (
                <Typography color="#7a859b" fontSize={14} align="center" mt={1}>
                  No one online
                </Typography>
              ) : (
                onlineUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 1,
                      borderRadius: 3,
                      bgcolor: user.id === userId ? '#7f5af0' : 'transparent',
                      width: '100%',
                      transition: 'background-color 0.3s',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: user.id === userId ? '#ffd166' : '#2ec4b6',
                        fontWeight: 'bold',
                        mr: 1.5,
                        width: 34,
                        height: 34,
                        fontSize: 17,
                        color: '#21213a',
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography sx={{ color: '#f8fafc', fontWeight: user.id === userId ? 700 : 400 }}>
                      {user.username} {user.id === userId ? '(You)' : ''}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
            {/* Chat Main */}
            <Box
              sx={{
                flex: 1,
                p: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              {/* Header */}
              <Typography
                variant="h5"
                align="center"
                sx={{ color: '#dde6f2', mt: 1, mb: 1, letterSpacing: 1.5 }}
              >
                Chat Room
              </Typography>

              {/* Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  mb: 2,
                  px: 1,
                  bgcolor: 'rgba(22,25,44,0.94)',
                  borderRadius: 3,
                  boxShadow: 'inset 0 2px 18px #2d274d',
                  scrollBehavior: 'smooth',
                }}
              >
                {messages.map((msg, idx) => {
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const isSameUser = prevMsg && prevMsg.userId === msg.userId;
                  const timeDiff = prevMsg
                    ? new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()
                    : null;
                  const withinFiveMinutes = timeDiff !== null && timeDiff < 5 * 60 * 1000;
                  const hideHeader = isSameUser && withinFiveMinutes;

                  const sent = msg.userId === userId;
                  return (
                    <Box
                      key={idx}
                      mb={hideHeader ? 0.4 : 1.2}
                      mt={hideHeader ? 0 : 1.2}
                      display="flex"
                      justifyContent={sent ? 'flex-end' : 'flex-start'}
                    >
                      <Box
                        sx={{
                          backgroundColor: sent ? 'linear-gradient(135deg, #689cf0 80%, #7f5af0 100%)' : '#191931',
                          color: sent ? '#fff' : '#dbeafe',
                          p: { xs: 1, sm: 2 },
                          borderRadius: 5,
                          boxShadow: sent
                            ? '0 2px 18px 0 #7f5af0bb'
                            : '0 2px 14px 0 #0a152cbb',
                          minWidth: 110,
                          maxWidth: { xs: '70%', sm: '66%' },
                          transition: 'box-shadow 0.15s',
                        }}
                      >
                        {!hideHeader && (
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={
                              sent ? { color: '#ffd166', mb: 0.5 } : { color: '#62d6e8', mb: 0.5 }
                            }
                          >
                            {sent ? 'You' : msg.username || msg.userId}
                          </Typography>
                        )}
                        {msg.fileUrl ? (
                          msg.fileUrl.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i) ? (
                              <a
                                href={`http://localhost:5000${msg.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ wordBreak: 'break-word', color: 'inherit' }}
                                onClick={e => e.stopPropagation()}
                              >
                                <img
                                  src={`http://localhost:5000${msg.fileUrl}`}
                                  alt={msg.fileUrl.split('/').pop()}
                                  style={{ maxWidth: '96%', maxHeight: 210, borderRadius: 9, boxShadow: '0 1px 12px #000b' }}
                                />
                              </a>
                            ) : (
                              <a
                                href={`http://localhost:5000${msg.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  wordBreak: 'break-word',
                                  textDecoration: 'underline',
                                  color: '#ffd166',
                                  fontWeight: 600,
                                }}
                                onClick={e => e.stopPropagation()}
                              >
                                {msg.fileUrl.split('/').pop()}
                              </a>
                            )
                          ) : (
                            <Typography sx={{ fontSize: 16, fontWeight: 500, py: 0.5 }}>
                              {msg.content}
                            </Typography>
                          )}
                        {!hideHeader && (
                          <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, color: '#b8bfff', display: 'block' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
                {typingUsers.length > 0 && (
                  <Typography variant="caption" color="#dbeafe" sx={{ mb: 1 }}>
                    {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                  </Typography>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* File Upload and Message Input */}
              <Box display="flex" alignItems="center" gap={1} pb={1} pt={0.5}>
                <IconButton
                  color="primary"
                  component="label"
                  sx={{
                    bgcolor: '#ffd166',
                    '&:hover': { bgcolor: '#62d6e8' },
                    color: '#21213a',
                    fontSize: 22,
                  }}
                >
                  <AttachFileIcon />
                  <input type="file" hidden onChange={handleFileChange} />
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!file}
                  onClick={sendFile}
                  sx={{ fontWeight: 600, py: 1.1, bgcolor: '#62d6e8', color: '#111938', '&:hover': { bgcolor: '#ffd166', color: '#222' } }}
                >
                  Send File
                </Button>
                <TextField
                  multiline
                  minRows={2}
                  maxRows={5}
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={handleKeyPress}
                  fullWidth
                  sx={{
                    bgcolor: '#222849',
                    borderRadius: 2.5,
                    input: { color: '#e0e7ff', fontSize: 16 },
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!message.trim()}
                  onClick={sendMessage}
                  sx={{
                    fontWeight: 700,
                    py: 1.1,
                    bgcolor: '#7f5af0',
                    color: '#fff',
                    '&:hover': { bgcolor: '#62d6e8', color: '#1e2036' }
                  }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Chat;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   IconButton,
//   Grid,
//   Avatar,
//   useTheme,
//   useMediaQuery,
// } from '@mui/material';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import Particles from 'react-tsparticles';
// import { loadFull } from 'tsparticles';
// import io from 'socket.io-client';
// import axios from 'axios';

// const token = localStorage.getItem('token');
// const socket = io('http://localhost:5000', { auth: { token } });

// function Chat({ userId, username }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [file, setFile] = useState(null);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef();

//   const particlesInit = useCallback(async (engine) => {
//     await loadFull(engine);
//   }, []);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/messages', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMessages(res.data);
//       } catch (err) {
//         console.error('Error fetching messages:', err);
//       }
//     };
//     fetchMessages();
//   }, []);

//   useEffect(() => {
//     socket.on('chatMessage', (data) => {
//       setMessages((prev) => {
//         const isDuplicate = prev.some(
//           (msg) =>
//             msg.content === data.content &&
//             new Date(msg.timestamp).getTime() === new Date(data.timestamp).getTime() &&
//             msg.userId === data.userId
//         );
//         if (isDuplicate) return prev;
//         return [...prev, data];
//       });
//     });

//     socket.on('typing', (data) => {
//       setTypingUsers((prev) => {
//         if (!prev.includes(data.username) && data.username !== username) {
//           return [...prev, data.username];
//         }
//         return prev;
//       });
//     });

//     socket.on('stopTyping', (data) => {
//       setTypingUsers((prev) => prev.filter((u) => u !== data.username));
//     });

//     socket.on('onlineUsers', (users) => {
//       setOnlineUsers(users);
//     });

//     return () => {
//       socket.off('chatMessage');
//       socket.off('typing');
//       socket.off('stopTyping');
//       socket.off('onlineUsers');
//     };
//   }, [username]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleTyping = () => {
//     socket.emit('typing', { username });
//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit('stopTyping', { username });
//     }, 1500);
//   };

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const sendFile = async () => {
//     if (!file) return;
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const res = await axios.post('http://localhost:5000/api/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const fileMessage = {
//         userId,
//         username,
//         content: '',
//         fileUrl: res.data.fileUrl,
//         timestamp: new Date().toISOString(),
//       };

//       socket.emit('chatMessage', fileMessage);
//       setFile(null);
//     } catch (err) {
//       console.error('File upload failed', err);
//     }
//   };

//   const sendMessage = () => {
//     if (!message.trim()) return;
//     const messageData = {
//       userId,
//       username,
//       content: message.trim(),
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit('chatMessage', messageData);
//     setMessage('');
//     socket.emit('stopTyping', { username });
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
//       {/* 3D Palette Particle Background */}
//       <Particles
//         id="tsparticles"
//         init={particlesInit}
//         options={{
//           fullScreen: { enable: true, zIndex: -1 },
//           background: { color: { value: "#191931" } },
//           fpsLimit: 60,
//           particles: {
//             number: { value: 70, density: { enable: true, area: 800 } },
//             color: { value: ["#62d6e8", "#9867f0", "#ffd166"] },
//             shape: { type: "circle" },
//             opacity: { value: 0.65, random: true },
//             size: { value: 3, random: true },
//             move: { enable: true, speed: 2, outModes: 'bounce' },
//             links: {
//               enable: true,
//               distance: 110,
//               color: "#a3a3ff",
//               opacity: 0.25,
//               width: 2,
//             },
//           },
//           interactivity: {
//             events: { onHover: { enable: true, mode: "repulse" } },
//             modes: { repulse: { distance: 100 } },
//           },
//           detectRetina: true,
//         }}
//       />

//       <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
//         <Grid item xs={12} md={10} lg={8}>
//           <Paper
//             elevation={24}
//             sx={{
//               display: 'flex',
//               p: 0,
//               borderRadius: 4,
//               height: isMobile ? '94vh' : 620,
//               minHeight: isMobile ? 'auto' : 620,
//               maxHeight: 700,
//               bgcolor: 'rgba(28,30,43,0.97)',
//               overflow: 'hidden',
//               boxShadow: '0 6px 48px #000a',
//             }}
//           >
//             {/* Sidebar */}
//             <Box
//               sx={{
//                 width: { xs: 120, sm: 190 },
//                 flexShrink: 0,
//                 bgcolor: '#222849',
//                 py: 3,
//                 px: { xs: 1, sm: 2 },
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 borderRight: '2px solid #373e69',
//                 minHeight: '100%',
//               }}
//             >
//               <Typography variant="h6" sx={{ color: '#cbbcff', mb: 2, letterSpacing: 1 }}>
//                 Online Users
//               </Typography>
//               {onlineUsers.length === 0 ? (
//                 <Typography color="#7a859b" fontSize={14} align="center" mt={1}>
//                   No one online
//                 </Typography>
//               ) : (
//                 onlineUsers.map((user) => (
//                   <Box
//                     key={user.id}
//                     sx={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       mb: 2,
//                       p: 1,
//                       borderRadius: 3,
//                       bgcolor: user.id === userId ? '#7f5af0' : 'transparent',
//                       width: '100%',
//                       transition: 'background-color 0.3s',
//                     }}
//                   >
//                     <Avatar
//                       sx={{
//                         bgcolor: user.id === userId ? '#ffd166' : '#2ec4b6',
//                         fontWeight: 'bold',
//                         mr: 1.5,
//                         width: 34,
//                         height: 34,
//                         fontSize: 17,
//                         color: '#21213a',
//                       }}
//                     >
//                       {user.username.charAt(0).toUpperCase()}
//                     </Avatar>
//                     <Typography sx={{ color: '#f8fafc', fontWeight: user.id === userId ? 700 : 400 }}>
//                       {user.username} {user.id === userId ? '(You)' : ''}
//                     </Typography>
//                   </Box>
//                 ))
//               )}
//             </Box>

//             {/* Chat Main */}
//             <Box
//               sx={{
//                 flex: 1,
//                 p: { xs: 1, sm: 2 },
//                 display: 'flex',
//                 flexDirection: 'column',
//                 height: '100%',
//                 justifyContent: 'space-between',
//               }}
//             >
//               {/* Header */}
//               <Typography
//                 variant="h5"
//                 align="center"
//                 sx={{ color: '#dde6f2', mt: 1, mb: 1, letterSpacing: 1.5 }}
//               >
//                 Chat Room
//               </Typography>

//               {/* Messages */}
//               <Box
//                 sx={{
//                   flexGrow: 1,
//                   overflowY: 'auto',
//                   mb: 2,
//                   px: 1,
//                   bgcolor: 'rgba(22,25,44,0.94)',
//                   borderRadius: 3,
//                   boxShadow: 'inset 0 2px 18px #2d274d',
//                   scrollBehavior: 'smooth',
//                 }}
//               >
//                 {messages.map((msg, idx) => {
//                   const prevMsg = idx > 0 ? messages[idx - 1] : null;
//                   const isSameUser = prevMsg && prevMsg.userId === msg.userId;
//                   const timeDiff = prevMsg
//                     ? new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()
//                     : null;
//                   const withinFiveMinutes = timeDiff !== null && timeDiff < 5 * 60 * 1000;
//                   const hideHeader = isSameUser && withinFiveMinutes;

//                   const sent = msg.userId === userId;
//                   return (
//                     <Box
//                       key={idx}
//                       mb={hideHeader ? 0.4 : 1.2}
//                       mt={hideHeader ? 0 : 1.2}
//                       display="flex"
//                       justifyContent={sent ? 'flex-end' : 'flex-start'}
//                     >
//                       <Box
//                         sx={{
//                           backgroundColor: sent ? 'linear-gradient(135deg, #689cf0 80%, #7f5af0 100%)' : '#191931',
//                           color: sent ? '#fff' : '#dbeafe',
//                           p: { xs: 1, sm: 2 },
//                           borderRadius: 5,
//                           boxShadow: sent
//                             ? '0 2px 18px 0 #7f5af0bb'
//                             : '0 2px 14px 0 #0a152cbb',
//                           minWidth: 110,
//                           maxWidth: { xs: '70%', sm: '66%' },
//                           transition: 'box-shadow 0.15s',
//                         }}
//                       >
//                         {!hideHeader && (
//                           <Typography
//                             variant="subtitle1"
//                             fontWeight="bold"
//                             sx={
//                               sent ? { color: '#ffd166', mb: 0.5 } : { color: '#62d6e8', mb: 0.5 }
//                             }
//                           >
//                             {sent ? 'You' : msg.username || msg.userId}
//                           </Typography>
//                         )}

//                         {msg.fileUrl ? (
//                           msg.fileUrl.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i) ? (
//                             <a
//                               href={`http://localhost:5000${msg.fileUrl}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               style={{ wordBreak: 'break-word', color: 'inherit' }}
//                               onClick={e => e.stopPropagation()}
//                             >
//                               <img
//                                 src={`http://localhost:5000${msg.fileUrl}`}
//                                 alt={msg.fileUrl.split('/').pop()}
//                                 style={{ maxWidth: '96%', maxHeight: 210, borderRadius: 9, boxShadow: '0 1px 12px #000b' }}
//                               />
//                             </a>
//                           ) : (
//                             <a
//                               href={`http://localhost:5000${msg.fileUrl}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               style={{
//                                 wordBreak: 'break-word',
//                                 textDecoration: 'underline',
//                                 color: '#ffd166',
//                                 fontWeight: 600,
//                               }}
//                               onClick={e => e.stopPropagation()}
//                             >
//                               {msg.fileUrl.split('/').pop()}
//                             </a>
//                           )
//                         ) : (
//                           <Typography sx={{ fontSize: 16, fontWeight: 500, py: 0.5 }}>
//                             {msg.content}
//                           </Typography>
//                         )}

//                         {!hideHeader && (
//                           <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, color: '#b8bfff', display: 'block' }}>
//                             {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                           </Typography>
//                         )}
//                       </Box>
//                     </Box>
//                   );
//                 })}
//                 {typingUsers.length > 0 && (
//                   <Typography variant="caption" color="#dbeafe" sx={{ mb: 1 }}>
//                     {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
//                   </Typography>
//                 )}
//                 <div ref={messagesEndRef} />
//               </Box>

//               {/* File Upload and Message Input */}
//               <Box display="flex" alignItems="center" gap={1} pb={1} pt={0.5}>
//                 <IconButton
//                   color="primary"
//                   component="label"
//                   sx={{
//                     bgcolor: '#ffd166',
//                     '&:hover': { bgcolor: '#62d6e8' },
//                     color: '#21213a',
//                     fontSize: 22,
//                   }}
//                 >
//                   <AttachFileIcon />
//                   <input type="file" hidden onChange={handleFileChange} />
//                 </IconButton>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   disabled={!file}
//                   onClick={sendFile}
//                   sx={{ fontWeight: 600, py: 1.1, bgcolor: '#62d6e8', color: '#111938', '&:hover': { bgcolor: '#ffd166', color: '#222' } }}
//                 >
//                   Send File
//                 </Button>
//                 <TextField
//                   multiline
//                   minRows={2}
//                   maxRows={5}
//                   placeholder="Type your message..."
//                   value={message}
//                   onChange={(e) => {
//                     setMessage(e.target.value);
//                     handleTyping();
//                   }}
//                   onKeyDown={handleKeyPress}
//                   fullWidth
//                   sx={{
//                     bgcolor: '#222849',
//                     borderRadius: 2.5,
//                     input: { color: '#e0e7ff', fontSize: 16 },
//                   }}
//                 />
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   disabled={!message.trim()}
//                   onClick={sendMessage}
//                   sx={{
//                     fontWeight: 700,
//                     py: 1.1,
//                     bgcolor: '#7f5af0',
//                     color: '#fff',
//                     '&:hover': { bgcolor: '#62d6e8', color: '#1e2036' }
//                   }}
//                 >
//                   Send
//                 </Button>
//               </Box>
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }

// export default Chat;
