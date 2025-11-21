const mongoose = require('mongoose');

const AuthLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String, index: true },
  event: { type: String, enum: ['signup','signin','failed_signin','failed_signup','signout'], required: true },
  success: { type: Boolean, required: true },
  ip: { type: String },
  userAgent: { type: String },
  reason: { type: String }, // e.g. "email_taken", "weak_password"
  createdAt: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { versionKey: false });

module.exports = mongoose.model('AuthLog', AuthLogSchema);