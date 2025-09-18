const express = require('express');
const router = express.Router();
const PrivateMessage = require('../models/PrivateMessage');
const  protect = require('../middleware/authMiddleware'); 
// GET /api/chat/private/:userA/:userB
router.get('/chat/private/:userA/:userB', protect, async (req, res) => {
  const { userA, userB } = req.params;
  try {
    const messages = await PrivateMessage.find({
      $or: [
        { from: userA, to: userB },
        { from: userB, to: userA }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('from', 'username')   // this is key!
    .populate('to', 'username')     // you can also add this if needed
    .lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to get private messages" });
  }
});


module.exports = router;

