const mongoose = require("mongoose");

const privateMessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  fileUrl: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Require either content or fileUrl
privateMessageSchema.pre('validate', function(next) {
  if (!this.content && !this.fileUrl) {
    next(new Error('Either content or fileUrl must be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model("PrivateMessage", privateMessageSchema);
