require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// INIT APP
const app = express();
app.use(cors());
app.use(express.json());

// UPLOADS FOLDER
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ROUTES
app.use("/api/auth", require("./routes/auth"));                  // Register / Login
app.use("/api/ocr", require("./routes/ocr"));                    // Tesseract OCR
app.use("/api/logo", require("./routes/logo"));                  // Clarifai Logo Detection
app.use("/api/history", require("./routes/history"));            // User history

// HOME ROUTE
app.get("/", (req, res) => {
    res.json({ message: "Backend Running Successfully", status: "OK" });
});

// MONGODB CONNECT
const MONGO = process.env.MONGO_URI;

if (MONGO) {
    mongoose.connect(MONGO)
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.error("Mongo Error:", err));
} else {
    console.log("⚠ MONGO_URI not set – running without DB. History won't work.");
}

// PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("🔥 Server running on port " + PORT);
});