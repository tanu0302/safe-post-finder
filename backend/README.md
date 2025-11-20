Safe Post Finder — Backend with Google Vision
--------------------------------------------
This backend includes:
- Auth (signup/login) with JWT
- Detection routes for text (OCR), logo matching (phash), image analysis (labels), URL scanning
- Google Vision integration (text, logos, label detection, web detection) when DETECTION_PROVIDER=google
- History logging

Quick start:
1. Copy .env.example -> .env and edit (set MONGODB_URI and GOOGLE_APPLICATION_CREDENTIALS if using Google)
2. npm install
3. npm start

Endpoints:
POST /api/auth/signup
POST /api/auth/login
POST /api/detect/text        (form field 'image')
POST /api/detect/logo        (form field 'image')
POST /api/detect/logo/register (form field 'image', body 'name')
POST /api/detect/image       (general image analysis)
POST /api/detect/url         (body { url })
POST /api/detect/audio       (audio -> speech-to-text) [google only]
GET  /api/history            (list recent checks)
POST /api/history/save       (save a check result)
GET  /api/admin/logos        (list logos)
