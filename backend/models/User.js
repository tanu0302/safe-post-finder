const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },   // email verified?
  lastLoginAt: { type: Date, default: null },
  roles: { type: [String], default: ['user'] },
  metadata: { type: mongoose.Schema.Types.Mixed } // device, referrer, source
}, { versionKey: false });

module.exports = mongoose.model('User', UserSchema);