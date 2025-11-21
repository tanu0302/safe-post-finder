const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

// Multer setup for image upload
const upload = multer({ dest: "uploads/" });

const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
const CLARIFAI_MODEL_ID = process.env.CLARIFAI_MODEL_ID;
const CLARIFAI_USER_ID = process.env.CLARIFAI_USER_ID || "clarifai"; 
const CLARIFAI_APP_ID = process.env.CLARIFAI_APP_ID || "main";

// Clarifai API Endpoint
const CLARIFAI_URL = `https://api.clarifai.com/v2/users/${CLARIFAI_USER_ID}/apps/${CLARIFAI_APP_ID}/models/${CLARIFAI_MODEL_ID}/outputs` ;

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Convert image to base64
    const imageBytes = fs.readFileSync(req.file.path, { encoding: "base64" });

    // Make request to Clarifai
    const response = await axios.post(
      CLARIFAI_URL,
      {
        inputs: [
          {
            data: {
              image: {
                base64: imageBytes,
              },
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Key ${CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Delete temp image
    fs.unlinkSync(req.file.path);

    const clarifaiOutput = response.data.outputs[0];

    return res.json({
      success: true,
      data: clarifaiOutput,
    });

  } catch (error) {
    console.error("Clarifai Error:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Clarifai request failed",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;