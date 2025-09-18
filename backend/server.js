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
const messageRoutes = require('./routes/messages'); // your global messages routes
const privateRoutes = require('./routes/private');
const groupRoutes = require('./routes/group');
const groupMessagesRoutes = require('./routes/groupMessages');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// If you already have auth middleware file, use it.
// Otherwise define 'protect' inline and export it to use in routes OR keep using middleware/authMiddleware as used above.
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, ... } depending on your token payload
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Mount routes (group routes expect a middleware auth file named middleware/authMiddleware)
// If you don't have middleware/authMiddleware, either create it using the same protect above or import the protect here
app.use('/api/auth', authRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api', privateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/group', groupRoutes);            // group create & get
app.use('/api/group', groupMessagesRoutes);    // group messages (/:groupId/messages)
app.use('/api', userRoutes);

app.get('/', (req, res) => res.send('API running'));

// Global chat summary endpoint if you need it
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

// socket auth middleware (use token from handshake.auth)
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user; // { id: ..., username: ... }
    // join personal room for direct messages if desired
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

  // GLOBAL CHAT
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

  // GROUPS: join all groups the user is part of
  socket.on('joinGroups', async () => {
    try {
      const groups = await Group.find({ members: socket.user.id });
      groups.forEach(g => socket.join(g._id.toString()));
    } catch (err) {
      console.error('joinGroups error:', err.message);
    }
  });

  // Join a single group ? server verifies membership
  socket.on('joinGroup', async (groupId) => {
    try {
      const group = await Group.findById(groupId);
      if (group && group.members.map(String).includes(String(socket.user.id))) {
        socket.join(groupId);
      } else {
        console.warn(`Socket: user ${socket.user.id} tried to join group ${groupId} without membership`);
      }
    } catch (err) {
      console.error('joinGroup error:', err.message);
    }
  });

  socket.on('leaveGroup', (groupId) => {
    try { socket.leave(groupId); } catch (err) { /* ignore */ }
  });

  // SEND a group message ? server verifies membership and uses socket.user.id as sender
  socket.on('groupMessage', async ({ groupId, message }) => {
    try {
      const group = await Group.findById(groupId).lean();
      if (!group) return;
      if (!group.members.map(String).includes(String(socket.user.id))) {
        console.warn(`Socket: user ${socket.user.id} tried to send message to ${groupId} without membership`);
        return;
      }

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

  // TYPING (optional)
  socket.on('typing', (data) => socket.broadcast.emit('typing', data));
  socket.on('stopTyping', (data) => socket.broadcast.emit('stopTyping', data));

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

