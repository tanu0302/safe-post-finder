const tesseract = require('node-tesseract-ocr');
const imageHash = require('image-hash');
const sharp = require('sharp');

function computePhash(filePath, bits=16) {
  return new Promise((resolve,reject) => {
    imageHash.hash(filePath, bits, 'hex', (err,data) => {
      if(err) return reject(err);
      resolve(data);
    });
  });
}

function hammingDistanceHex(a,b) {
  if(!a||!b) return 999;
  const ba = Buffer.from(a,'hex');
  const bb = Buffer.from(b,'hex');
  let dist = 0;
  for(let i=0;i<Math.min(ba.length,bb.length);i++){
    dist += ((ba[i]^bb[i]).toString(2).match(/1/g)||[]).length;
  }
  return dist;
}

async function detectText(filePath) {
  const config = { lang:'eng', oem:1, psm:3 };
  const text = await tesseract.recognize(filePath, config);
  return { fullText: text };
}

async function detectLogos(filePath, maxHamming=12) {
  const phash = await computePhash(filePath);
  const Logo = require('../models/Logo');
  const logos = await Logo.find({});
  const matches = logos.map(l => {
    const dist = hammingDistanceHex(phash, l.phash);
    return { id: l._id, name: l.name, filename: l.filename, phash:l.phash, distance:dist };
  }).filter(m=>m.distance<=maxHamming).sort((a,b)=>a.distance-b.distance);
  return { phash, matches };
}

async function detectImage(filePath) {
  // lightweight: try sharp to get metadata and basic colors (placeholder)
  const meta = await sharp(filePath).metadata();
  return { metadata: meta };
}

module.exports = { computePhash, detectText, detectLogos, detectImage };
