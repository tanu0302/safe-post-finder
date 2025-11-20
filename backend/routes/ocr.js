const express = require("express");
const router = express.Router();
const multer = require("multer");
const tesseract = require("node-tesseract-ocr");

const upload = multer({ dest: "uploads/images" });

router.post("/text", upload.single("image"), async (req, res) => {
  try {
    const text = await tesseract.recognize(req.file.path, { lang: "eng" });
    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({ error: "OCR failed" });
  }
});

module.exports = router;