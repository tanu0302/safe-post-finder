const mongoose = require('mongoose');
const LogoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hash: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });
module.exports = mongoose.model('Logo', LogoSchema);