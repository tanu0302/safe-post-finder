// backend/models/History.js
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String },          // "logo" | "text" | "ocr" etc.
  query: { type: String },         // original input (text or filename)
  result: { type: mongoose.Schema.Types.Mixed }, // detection result
}, { timestamps: true });

module.exports = mongoose.model('History', HistorySchema);