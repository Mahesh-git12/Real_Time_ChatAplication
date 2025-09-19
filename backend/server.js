require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');

// Models & Routes
const User = require('./models/User');
const Message = require('./models/Message');
const Group = require('./models/Group');
const GroupMessage = require('./models/GroupMessage');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const privateRoutes = require('./routes/private');
const groupRoutes = require('./routes/group');
const groupMessagesRoutes = require('./routes/groupMessages');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://real-time-chat-application-lac-nu.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});



app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for token auth
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api', privateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/group', groupMessagesRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => res.send('API running'));

// Global chat fetch
app.get('/api/messages', protect, async (req, res) => {
  const messages = await Message.find().populate('sender', 'username profilePhoto').sort({ createdAt: 1 });
  res.json(messages.map(m => ({
    _id: m._id,
    userId: m.sender?._id,
    username: m.sender?.username,
    content: m.content,
    fileUrl: m.fileUrl,
    createdAt: m.createdAt
  })));
});

// SOCKET.IO
const onlineUsers = new Set();

async function broadcastOnlineUsers() {
  try {
    const users = await User.find({ _id: { $in: Array.from(onlineUsers) } }).select('username profilePhoto');
    const onlineList = users.map(u => ({ id: u._id, username: u.username, profilePhoto: u.profilePhoto || "" }));
    io.emit('onlineUsers', onlineList);
  } catch (err) {
    console.error('broadcastOnlineUsers error:', err.message);
  }
}

// Socket authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    socket.join(user.id);
    next();
  } catch (err) {
    console.error('Socket auth error:', err.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  onlineUsers.add(String(socket.user.id));
  broadcastOnlineUsers();

  // ✅ GLOBAL CHAT
  socket.on('chatMessage', async (msg) => {
    try {
      const saved = await Message.create({
        sender: socket.user.id,
        content: msg.content,
        fileUrl: msg.fileUrl || '',
        createdAt: new Date()
      });
      io.emit('chatMessage', {
        userId: socket.user.id,
        username: socket.user.username,
        content: msg.content,
        fileUrl: msg.fileUrl || '',
        createdAt: saved.createdAt
      });
    } catch (err) {
      console.error('Global message error:', err.message);
    }
  });

  // ✅ GROUP CHAT
  socket.on('joinGroups', async () => {
    try {
      const groups = await Group.find({ members: socket.user.id });
      groups.forEach(g => socket.join(g._id.toString()));
    } catch (err) {
      console.error('joinGroups error:', err.message);
    }
  });

  socket.on('joinGroup', async (groupId) => {
    try {
      const group = await Group.findById(groupId);
      if (group && group.members.map(String).includes(String(socket.user.id))) {
        socket.join(groupId);
      }
    } catch (err) {
      console.error('joinGroup error:', err.message);
    }
  });

  socket.on('groupMessage', async ({ groupId, message }) => {
    try {
      const group = await Group.findById(groupId).lean();
      if (!group) return;
      if (!group.members.map(String).includes(String(socket.user.id))) return;

      const groupMsg = new GroupMessage({
        group: groupId,
        sender: socket.user.id,
        message,
        createdAt: new Date()
      });
      await groupMsg.save();
      const populated = await groupMsg.populate('sender', 'username profilePhoto');

      io.to(groupId).emit('groupMessage', {
        groupId,
        sender: populated.sender,
        message: populated.message,
        createdAt: populated.createdAt
      });
    } catch (err) {
      console.error('groupMessage error:', err.message);
    }
  });

  // ✅ PRIVATE CHAT
  // ✅ PRIVATE CHAT
socket.on("privateMessage", async (msg) => {
  try {
    const { to, content, fileUrl, timestamp } = msg;

    // Store to DB using correct model and keys
    const newMessage = await PrivateMessage.create({
      from: socket.user.id,
      to,
      content: content || "",
      fileUrl: fileUrl || "",
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // Populate sender for response
    const populated = await newMessage.populate("from", "username profilePhoto");

    // Send to recipient
    io.to(to).emit("privateMessage", {
      from: String(socket.user.id),
      to: String(to),
      username: populated.from.username,
      profilePhoto: populated.from.profilePhoto || "",
      content: populated.content,
      fileUrl: populated.fileUrl,
      timestamp: populated.timestamp,
    });

    // Send back to sender (for confirmation)
    io.to(socket.user.id).emit("privateMessage", {
      from: String(socket.user.id),
      to: String(to),
      username: populated.from.username,
      profilePhoto: populated.from.profilePhoto || "",
      content: populated.content,
      fileUrl: populated.fileUrl,
      timestamp: populated.timestamp,
    });
  } catch (err) {
    console.error("privateMessage error:", err.message);
  }
});


  socket.on('disconnect', () => {
    onlineUsers.delete(String(socket.user.id));
    broadcastOnlineUsers();
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

