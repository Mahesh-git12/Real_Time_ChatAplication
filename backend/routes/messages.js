// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Global chat history
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate('sender', 'username')
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages.map(msg => ({
      userId: msg.sender._id,
      username: msg.sender.username,
      content: msg.content,
      fileUrl: msg.fileUrl,
      createdAt: msg.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
