const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const GroupMessage = require('../models/GroupMessage');
const protect = require('../middleware/authMiddleware');


// Create a group (creator + chosen members)
router.post('/create', protect, async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name)
      return res.status(400).json({ message: 'Group name required' });

    const uniqueMembers = Array.isArray(members)
      ? [...new Set(members.map(String))]
      : [];
    // ensure the creator is included
    if (!uniqueMembers.includes(String(req.user.id)))
      uniqueMembers.push(String(req.user.id));

    const group = new Group({
      name,
      creator: req.user.id,
      members: uniqueMembers
    });

    await group.save();
    const gp = await Group.findById(group._id)
      .populate('creator', 'username')
      .populate('members', 'username profilePhoto');
    res.status(201).json(gp);
  } catch (err) {
    console.error('Create group error:', err.message);
    res.status(500).json({ message: err.message });
  }
});



// Get groups for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('creator', 'username')
      .populate('members', 'username profilePhoto')
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error('Get groups error:', err.message);
    res.status(500).json({ message: err.message });
  }
});



// Get groups for a particular user id (optional)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: 'User id required' });
    // if (String(req.user.id) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });
    const groups = await Group.find({ members: userId })
      .populate('creator', 'username')
      .populate('members', 'username profilePhoto');
    res.json(groups);
  } catch (err) {
    console.error('Get groups by user error:', err.message);
    res.status(500).json({ message: err.message });
  }
});



router.post('/:id/leave', protect, async (req, res) => {
  const groupId = req.params.id;
  try {
    await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: req.user.id } }
    );
    res.json({ left: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to leave group', error: err.message });
  }
});



// DELETE a group (by creator only, now robust)
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group)
      return res.status(404).json({ message: 'Group not found' });
    const currentUserId = req.user.id || req.user._id;
    if (String(group.creator) !== String(currentUserId))
      return res.status(403).json({ message: 'Only creator can delete group' });

    await GroupMessage.deleteMany({ group: req.params.id });
    await group.remove();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;



