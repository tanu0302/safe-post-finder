const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imghash = require('image-hash');
const Logo = require('../models/Logo');
const History = require('../models/History'); // optional if saving

const upload = multer({ dest: path.join(__dirname,'../uploads/images') });

// helper: compute bit-difference between two hex pHashes
function hammingHex(a, b) {
  if (!a || !b) return 999;
  if (a.length !== b.length) {
    const L = Math.max(a.length, b.length);
    a = a.padStart(L, '0'); b = b.padStart(L, '0');
  }
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const v1 = parseInt(a[i], 16);
    const v2 = parseInt(b[i], 16);
    let x = v1 ^ v2;
    // count set bits (nibble)
    dist += (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1);
  }
  return dist;
}

// POST /api/detect/logo (form-data file=<image>)
router.post('/logo', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const fp = req.file.path;

    // compute pHash (same options as seeding)
    imghash.hash(fp, 16, true, async (err, hash) => {
      if (err) {
        try { fs.unlinkSync(fp); } catch(e){}
        return res.status(500).json({ error: err.message });
      }

      const logos = await Logo.find({});
      const results = logos.map(l => ({ name: l.name, distance: hammingHex(hash, l.hash), meta: l.meta }));
      results.sort((a,b) => a.distance - b.distance);

      const best = results[0] || null;
      // define threshold for match (tune as needed). 8 is a good starting point for 16*4=64 bit hashes.
      const MATCH_THRESHOLD = 8;
      const match = best && best.distance <= MATCH_THRESHOLD ? best : null;

      // optionally save to history
      try { await History.create({ type: 'logo', query: req.file.originalname, result: { hash, match, results } }); } catch(e){}

      try { fs.unlinkSync(fp); } catch(e){}

      res.json({ success: true, hash, match, results });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server' });
  }
});

module.exports = router;