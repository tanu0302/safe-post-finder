// index.js
require('dotenv').config();          // 1) load .env first
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// uploads directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOAD_DIR, 'images'), { recursive: true });

// routes
app.use('/api/ocr', require('./routes/ocr'));    // local OCR route
app.use('/api/auth', require('./routes/auth'));  // if you have auth
app.use('/api/admin', require('./routes/admin')); // admin routes
app.use('/api/detect', require('./routes/detect')); // detection routes
app.get('/', (req, res) => res.json({ ok: true }));

// port + DB
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI || '';  // set in .env if using DB
if (URI) {
  mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=> {
      console.log('MongoDB Connected');
      app.listen(PORT, ()=> console.log('Server running on port', PORT));
    })
    .catch(err => {
      console.error('DB Error:', err.message);
      process.exit(1);
    });
} else {
  // if no DB, just start server
  app.listen(PORT, ()=> console.log('Server running on port', PORT));
}