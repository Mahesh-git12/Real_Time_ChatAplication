const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username profilePhoto status');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends', 'username profilePhoto');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.friends);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.profilePhoto !== undefined) updateData.profilePhoto = req.body.profilePhoto;
    if (req.body.username !== undefined) updateData.username = req.body.username;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('username profilePhoto status');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
