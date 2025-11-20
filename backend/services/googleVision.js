// Google Vision helper - requires GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON key)
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

async function detectText(filePath) {
  const [result] = await client.textDetection(filePath);
  const annotations = result.textAnnotations || [];
  const fullText = annotations[0] ? annotations[0].description : '';
  return { fullText, raw: result };
}

async function detectLogos(filePath) {
  const [result] = await client.logoDetection(filePath);
  const logos = (result.logoAnnotations || []).map(l => ({ description: l.description, score: l.score }));
  return { logos, raw: result };
}

async function detectImage(filePath) {
  const [labelRes] = await client.labelDetection(filePath);
  const labels = (labelRes.labelAnnotations || []).map(l=>({description:l.description,score:l.score}));
  const [safeRes] = await client.safeSearchDetection(filePath);
  const safe = safeRes.safeSearchAnnotation || {};
  const [webRes] = await client.webDetection(filePath);
  const web = webRes || {};
  return { labels, safe, web };
}

module.exports = { detectText, detectLogos, detectImage };
