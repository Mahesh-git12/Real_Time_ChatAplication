const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate('sender', 'username')
      .sort({ createdAt: 1 }) // oldest first
      .lean();

    const transformed = messages.map(msg => ({
      userId: msg.sender._id,
      username: msg.sender.username,
      content: msg.content,
      fileUrl: msg.fileUrl,
      createdAt: msg.createdAt // Always use createdAt!
    }));

    res.json(transformed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
