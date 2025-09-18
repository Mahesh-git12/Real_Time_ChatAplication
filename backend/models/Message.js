const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  fileUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }, // <-- use createdAt everywhere!
  room: { type: String, default: null }
});

// Require either content or fileUrl
messageSchema.pre('validate', function(next) {
  if (!this.content && !this.fileUrl) {
    next(new Error('Either content or fileUrl must be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);
