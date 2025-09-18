const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate('sender', 'username')
      .lean();

    const transformed = messages.map(msg => ({
      userId: msg.sender._id,
      username: msg.sender.username,
      content: msg.content,
      fileUrl: msg.fileUrl,     // Include fileUrl here!
      timestamp: msg.timestamp,
      room: msg.room,
    }));

    res.json(transformed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
