Clarifai Backend (logo detection) - Quickstart
Files: index.js, routes/clarifai.js, package.json

Steps to run:
1. Copy .env.example to .env and set CLARIFAI_API_KEY and (optionally) CLARIFAI_MODEL_ID.
2. npm install
3. npm start
4. POST an image to http://localhost:5000/api/clarifai/logo as form-data file=<image>

Notes:
- This app sends the uploaded image to Clarifai's REST API as base64 and returns the model output.
- You must have a Clarifai account and an API key. If you want to use a custom Clarifai model, set CLARIFAI_MODEL_ID to the model's id.