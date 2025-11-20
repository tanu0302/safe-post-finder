const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imghash = require('image-hash');
const Logo = require('../models/Logo');

const upload = multer({ dest: path.join(__dirname,'../uploads/logos') });

// seed a logo: form: name + file
router.post('/seed-logo', upload.single('file'), async (req, res) => {
  try {
    const name = req.body.name;
    if (!name || !req.file) return res.status(400).json({ error: 'name and file required' });

    const filepath = req.file.path;
    // compute pHash (16 => 16 hex chars; you can change size)
    imghash.hash(filepath, 16, true, async (err, hash) => {
      if (err) return res.status(500).json({ error: err.message });
      await Logo.findOneAndUpdate(
        { name },
        { name, hash, meta: { original: req.file.originalname } },
        { upsert: true, new: true }
      );
      // remove uploaded file after hashing
      try { fs.unlinkSync(filepath); } catch(e){}
      res.json({ success: true, name, hash });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server' });
  }
});

module.exports = router;