const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const upload = multer({ dest: path.join(__dirname,'../uploads') });

// POST /api/clarifai/logo
// form-data: file=<image>
router.post('/logo', upload.single('file'), async (req, res) => {
  try {
    if(!process.env.CLARIFAI_API_KEY) {
      return res.status(500).json({ error: 'CLARIFAI_API_KEY not set in .env' });
    }
    if(!req.file) return res.status(400).json({ error: 'file required' });

    const filePath = req.file.path;
    const b = fs.readFileSync(filePath);
    const b64 = b.toString('base64');

    const modelId = process.env.CLARIFAI_MODEL_ID || 'logo-detection';
    const url = `https://api.clarifai.com/v2/models/${encodeURIComponent(modelId)}/outputs`;

    const body = {
      inputs: [
        {
          data: {
            image: { base64: b64 }
          }
        }
      ]
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.CLARIFAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await resp.json();
    // cleanup uploaded file
    try { fs.unlinkSync(filePath); } catch(e){}

    if(!resp.ok) {
      return res.status(resp.status).json({ error: true, details: json });
    }
    return res.json({ success: true, output: json });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;