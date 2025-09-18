// const express = require('express');
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const User = require('../models/User');
// const authMiddleware = require("../middleware/authMiddleware");

// // Register
// // Register
// // Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     res.json({
//       token: user.generateToken(),
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profilePhoto: user.profilePhoto,
//         status: user.status
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Register
// router.post('/register', async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });

//     const user = await User.create({ username, email, password });
//     res.status(201).json({
//       token: user.generateToken(),
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profilePhoto: user.profilePhoto,
//         status: user.status
//       }
//     });
//   } catch (err) {
//     if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
//       return res.status(400).json({ message: 'Username already taken.' });
//     }
//     res.status(500).json({ message: err.message });
//   }
// });



// // Change Password - requires valid JWT
// router.post("/change-password", authMiddleware, async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   if (!currentPassword || !newPassword) return res.status(400).json({ message: "All fields required" });
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

//     user.password = newPassword;  // Assign plain password only here
//     await user.save();            // pre-save hook will handle hashing

//     res.json({ message: "Password changed successfully" });
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // Request password reset email
// router.post('/request-reset', async (req, res) => {
//   const { email } = req.body;
//   console.log("Reset request email:", email);
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Email not found" });

//     // Generate reset token & expiry
//     const token = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//     await user.save();

//     // Send reset email
//     const resetUrl = `http://localhost:3000/reset-password?token=${token}`; // Change to your frontend URL

//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//     });

//     await transporter.sendMail({
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: "Password Reset Request",
//       html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link is valid for 1 hour.</p>`,
//     });

//     res.json({ message: "Reset email sent" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Reset password using token
// router.post('/reset-password', async (req, res) => {
//   const { token, newPassword } = req.body;
//   try {
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });
//     if (!user) return res.status(400).json({ message: "Invalid or expired token." });

//     user.password = newPassword; // or hash if you prefer

//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     console.log("Password before save:", user.password);  // Log password before save

//     await user.save();

//     console.log("Password saved.");  // Log after save

//     res.json({ message: "Password has been reset successfully." });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require('../models/User');
const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password });
    res.status(201).json({ token: user.generateToken() }); // Or generate token however you do
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(400).json({ message: 'Username already taken.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ token: user.generateToken() }); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password - requires valid JWT
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: "All fields required" });
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

    user.password = newPassword;  // Assign plain password only here
    await user.save();            // pre-save hook will handle hashing

    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// Request password reset email
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  console.log("Reset request email:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Generate reset token & expiry
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`; // Change to your frontend URL

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link is valid for 1 hour.</p>`,
    });

    res.json({ message: "Reset email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    user.password = newPassword; // or hash if you prefer

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    console.log("Password before save:", user.password);  // Log password before save

    await user.save();

    console.log("Password saved.");  // Log after save

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
