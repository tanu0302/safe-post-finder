// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  createdAt: Date
});

module.exports = mongoose.model('User', userSchema);