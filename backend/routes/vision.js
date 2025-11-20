// routes/vision.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const upload = multer({ storage: multer.memoryStorage() });
const client = new ImageAnnotatorClient(); // uses GOOGLE_APPLICATION_CREDENTIALS

router.post('/logo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const [result] = await client.logoDetection({ image: { content: req.file.buffer } });
    res.json({ logos: result.logoAnnotations || [] });
  } catch (err) {
    console.error('logo error', err);
    res.status(500).json({ error: err.message || err });
  }
});

router.post('/text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const [result] = await client.textDetection({ image: { content: req.file.buffer } });
    res.json({ textAnnotations: result.textAnnotations || [] });
  } catch (err) {
    console.error('text error', err);
    res.status(500).json({ error: err.message || err });
  }
});

module.exports = router;