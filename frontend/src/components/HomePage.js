import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  Avatar,
  Stack,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL;

const getAvatarUrl = (profilePhoto) => {
  if (!profilePhoto) return undefined;
  if (profilePhoto.startsWith("http")) return profilePhoto;
  const base = API_BASE.replace(/\/+$/, "");
  const file = profilePhoto.replace(/^\/+/, "");
  return `${base}/${file}`;
};

function HomePage({ user, onlineUsers = [], setUser }) {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);
  const [dashboardUser, setDashboardUser] = useState(user);

  // Fetch latest user info on mount and when user._id changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchDashboardUser = async () => {
      if (!token || !user?._id) return;
      try {
        const res = await axios.get(`${API_BASE}/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardUser(res.data);
        setUser && setUser(res.data);  // sync global user state
        localStorage.setItem('user', JSON.stringify(res.data)); // sync to storage
      } catch (err) {
        // Optionally handle errors
      }
    };
    fetchDashboardUser();
  }, [user?._id, setUser]);

  // Fetch recent chats (last 5 messages)
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msgs = res.data.reverse().slice(0, 5);
        setRecentChats(msgs);
      } catch (err) {
        console.error("Failed to fetch recent chats:", err.message);
      }
    };
    fetchRecent();
  }, []);

  // Particle background config
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };
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

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          pt: 10,
          pb: 8,
          color: "#fff",
          userSelect: "none",
        }}
      >
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Dashboard
        </Typography>

        {/* Profile Info Section */}
        <Box
          sx={{
            bgcolor: "rgba(33, 33, 64, 0.7)",
            borderRadius: 3,
            boxShadow: "0 0 25px #7b5cf588",
            p: 3,
            mb: 5,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar
              src={getAvatarUrl(dashboardUser?.profilePhoto)}
              sx={{
                width: 90,
                height: 90,
                bgcolor: "#7b5cf5",
                fontSize: 36,
                border: "3px solid #9562e2",
              }}
            >
              {!dashboardUser?.profilePhoto &&
                (dashboardUser?.username
                  ? dashboardUser.username[0].toUpperCase()
                  : "?")}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                <strong>{dashboardUser?.username || "Unknown User"}</strong>
              </Typography>
              {dashboardUser?.email && (
                <Typography color="secondary.light">
                  {dashboardUser.email}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Status: </strong>{" "}
                {dashboardUser?.status || "No status set"}
              </Typography>
            </Box>
          </Stack>
          {/* Quick Navigation */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/group")}
            >
              Global Chat
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/private/select")}
            >
              Private Chat
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={() => navigate("/settings")}
            >
              Settings
            </Button>
          </Stack>
        </Box>

        {/* Online Users Section */}
        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Online Users
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {onlineUsers.length === 0 && (
              <Chip label="No users online" color="default" />
            )}
            {onlineUsers.map((usr) => (
              <Chip
                key={usr.id}
                avatar={
                  <Avatar
                    src={getAvatarUrl(usr.profilePhoto)}
                    sx={{ bgcolor: "#7b5cf5", fontSize: 18 }}
                  >
                    {!usr.profilePhoto &&
                      (usr.username ? usr.username[0].toUpperCase() : "?")}
                  </Avatar>
                }
                label={usr.username}
                sx={{
                  bgcolor: "rgba(123,92,245, 0.15)",
                  color: "#f8f8fa",
                  fontWeight: 600,
                  mr: 1,
                  mb: 1,
                  fontSize: 16,
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Recent Chats Section */}
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Chats
          </Typography>
          <Grid container spacing={3}>
            {recentChats.length === 0 && (
              <Typography sx={{ opacity: 0.6, pl: 2 }}>
                No recent chats yet.
              </Typography>
            )}
            {recentChats.map((chat) => (
              <Grid item xs={12} sm={6} md={4} key={chat._id}>
                <Box
                  sx={{ cursor: "pointer", height: "100%" }}
                  onClick={() => navigate(`/private/${chat.userId}`)}
                >
                  <Card
                    sx={{
                      bgcolor: "rgba(33, 33, 64, 0.8)",
                      borderRadius: 2,
                      boxShadow: "0 0 15px #7b5cf550",
                      px: 2,
                      py: 1.5,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      transition: "box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: "0 0 30px #9562e2dd",
                        bgcolor: "rgba(100,80,200,0.13)",
                      },
                    }}
                  >
                    <Avatar
                      src={getAvatarUrl(chat.profilePhoto)}
                      sx={{
                        bgcolor: "#7b5cf5",
                        mr: 2,
                        width: 46,
                        height: 46,
                        fontSize: 22,
                      }}
                    >
                      {!chat.profilePhoto &&
                        (chat.username ? chat.username[0].toUpperCase() : "?")}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#c8c8ff"
                      >
                        {chat.username}
                      </Typography>
                      <Divider sx={{ opacity: 0.24, my: 0.5 }} />
                      <Typography
                        variant="body2"
                        color="#b0b4d3"
                        sx={{
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: 180,
                        }}
                      >
                        {chat.content || chat.message}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;


// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Container,
//   Grid,
//   Card,
//   Avatar,
//   Stack,
//   Divider,
//   Chip,
//   Button,
// } from "@mui/material";
// import Particles from "react-tsparticles";
// import { loadFull } from "tsparticles";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const getAvatarUrl = (profilePhoto) => {
//   if (!profilePhoto) return undefined;
//   if (profilePhoto.startsWith("http")) return profilePhoto;
//   return `http://localhost:5000/${profilePhoto.replace(/^\/+/, "")}`;
// };

// function HomePage({ user, onlineUsers = [] }) {
//   const navigate = useNavigate();
//   const [recentChats, setRecentChats] = useState([]);

//   // Fetch recent chats (last 5 messages)
//   useEffect(() => {
//     const fetchRecent = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get("http://localhost:5000/api/messages", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const msgs = res.data.reverse().slice(0, 5); // last 5
//         setRecentChats(msgs);
//       } catch (err) {
//         console.error("Failed to fetch recent chats:", err.message);
//       }
//     };
//     fetchRecent();
//   }, []);

//   // Particle background setup
//   const particlesInit = async (engine) => {
//     await loadFull(engine);
//   };
//   const particlesOptions = {
//     fullScreen: { enable: false },
//     fpsLimit: 60,
//     background: { color: "#191931" },
//     particles: {
//       number: { value: 80, density: { enable: true, area: 900 } },
//       color: { value: ["#6b7afd", "#62d6e8", "#ffd166"] },
//       shape: { type: "circle" },
//       opacity: { value: 0.65, random: true },
//       size: { value: 3.5, random: true },
//       move: { enable: true, speed: 1.5, outModes: "bounce" },
//       links: {
//         enable: true,
//         distance: 130,
//         color: "#8b8de8",
//         opacity: 0.15,
//         width: 2,
//       },
//     },
//     detectRetina: true,
//   };

//   return (
//     <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
//       <Particles
//         id="tsparticles"
//         init={particlesInit}
//         options={particlesOptions}
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 0,
//         }}
//       />

//       <Container
//         maxWidth="lg"
//         sx={{
//           position: "relative",
//           zIndex: 2,
//           pt: 10,
//           pb: 8,
//           color: "#fff",
//           userSelect: "none",
//         }}
//       >
//         <Typography variant="h4" fontWeight="700" gutterBottom>
//           Dashboard
//         </Typography>

//         {/* Profile Info Section */}
//         <Box
//           sx={{
//             bgcolor: "rgba(33, 33, 64, 0.7)",
//             borderRadius: 3,
//             boxShadow: "0 0 25px #7b5cf588",
//             p: 3,
//             mb: 5,
//             maxWidth: 600,
//             mx: "auto",
//           }}
//         >
//           <Stack direction="row" alignItems="center" spacing={3}>
//             <Avatar
//               src={getAvatarUrl(user?.profilePhoto)}
//               sx={{
//                 width: 90,
//                 height: 90,
//                 bgcolor: "#7b5cf5",
//                 fontSize: 36,
//                 border: "3px solid #9562e2",
//               }}
//             >
//               {!user?.profilePhoto &&
//                 (user?.username ? user.username[0].toUpperCase() : "?")}
//             </Avatar>
//             <Box>
//               <Typography variant="h6" sx={{ mb: 1 }}>
//                 <strong>{user?.username || "Unknown User"}</strong>
//               </Typography>
//               {user?.email && (
//                 <Typography color="secondary.light">{user.email}</Typography>
//               )}
//               <Typography variant="body2" sx={{ mt: 1 }}>
//                 <strong>Status: </strong> {user?.status || "No status set"}
//               </Typography>
//             </Box>
//           </Stack>

//           {/* Quick Navigation */}
//           <Stack
//             direction="row"
//             spacing={2}
//             justifyContent="center"
//             sx={{ mt: 3 }}
//           >
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => navigate("/group")}
//             >
//               Global Chat
//             </Button>
//             <Button
//               variant="outlined"
//               color="secondary"
//               onClick={() => navigate("/private/select")}
//             >
//               Private Chat
//             </Button>
//             <Button
//               variant="outlined"
//               color="info"
//               onClick={() => navigate("/settings")}
//             >
//               Settings
//             </Button>
//           </Stack>
//         </Box>

//         {/* Online Users Section */}
//         <Box mb={5}>
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             Online Users
//           </Typography>
//           <Stack direction="row" spacing={2} flexWrap="wrap">
//             {onlineUsers.length === 0 && (
//               <Chip label="No users online" color="default" />
//             )}
//             {onlineUsers.map((usr) => (
//               <Chip
//                 key={usr.id}
//                 avatar={
//                   <Avatar
//                     src={getAvatarUrl(usr.profilePhoto)}
//                     sx={{ bgcolor: "#7b5cf5", fontSize: 18 }}
//                   >
//                     {!usr.profilePhoto &&
//                       (usr.username ? usr.username[0].toUpperCase() : "?")}
//                   </Avatar>
//                 }
//                 label={usr.username}
//                 sx={{
//                   bgcolor: "rgba(123,92,245, 0.15)",
//                   color: "#f8f8fa",
//                   fontWeight: 600,
//                   mr: 1,
//                   mb: 1,
//                   fontSize: 16,
//                 }}
//               />
//             ))}
//           </Stack>
//         </Box>

//         {/* Recent Chats Section */}
//         <Box>
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             Recent Chats
//           </Typography>
//           <Grid container spacing={3}>
//             {recentChats.length === 0 && (
//               <Typography sx={{ opacity: 0.6, pl: 2 }}>
//                 No recent chats yet.
//               </Typography>
//             )}
//             {recentChats.map((chat) => (
//               <Grid item xs={12} sm={6} md={4} key={chat._id}>
//                 <Box
//                   sx={{ cursor: "pointer", height: "100%" }}
//                   onClick={() => navigate(`/private/${chat.userId}`)}
//                 >
//                   <Card
//                     sx={{
//                       bgcolor: "rgba(33, 33, 64, 0.8)",
//                       borderRadius: 2,
//                       boxShadow: "0 0 15px #7b5cf550",
//                       px: 2,
//                       py: 1.5,
//                       height: 100,
//                       display: "flex",
//                       alignItems: "center",
//                       transition: "box-shadow 0.2s",
//                       "&:hover": {
//                         boxShadow: "0 0 30px #9562e2dd",
//                         bgcolor: "rgba(100,80,200,0.13)",
//                       },
//                     }}
//                   >
//                     <Avatar
//                       src={getAvatarUrl(chat.profilePhoto)}
//                       sx={{
//                         bgcolor: "#7b5cf5",
//                         mr: 2,
//                         width: 46,
//                         height: 46,
//                         fontSize: 22,
//                       }}
//                     >
//                       {!chat.profilePhoto &&
//                         (chat.username ? chat.username[0].toUpperCase() : "?")}
//                     </Avatar>
//                     <Box>
//                       <Typography
//                         variant="subtitle1"
//                         fontWeight="bold"
//                         color="#c8c8ff"
//                       >
//                         {chat.username}
//                       </Typography>
//                       <Divider sx={{ opacity: 0.24, my: 0.5 }} />
//                       <Typography
//                         variant="body2"
//                         color="#b0b4d3"
//                         sx={{
//                           whiteSpace: "nowrap",
//                           textOverflow: "ellipsis",
//                           overflow: "hidden",
//                           maxWidth: 180,
//                         }}
//                       >
//                         {chat.content || chat.message}
//                       </Typography>
//                     </Box>
//                   </Card>
//                 </Box>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       </Container>
//     </Box>
//   );
// }

// export default HomePage;
