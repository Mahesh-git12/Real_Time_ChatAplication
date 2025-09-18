const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const protect = require('../middleware/authMiddleware'); // ensure this exists

// GET /api/group/:groupId/messages
router.get('/:groupId/messages', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // check membership
    if (!group.members.map(String).includes(String(req.user.id))) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'username profilePhoto')
      .sort({ createdAt: 1 });

    // normalize for frontend
    const normalized = messages.map(m => ({
      _id: m._id,
      group: m.group,
      sender: m.sender,
      message: m.message,
      createdAt: m.createdAt
    }));

    res.json(normalized);
  } catch (err) {
    console.error('Fetch group messages error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
