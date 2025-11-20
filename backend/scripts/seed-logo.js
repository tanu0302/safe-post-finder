// scripts/seed-logo.js
const mongoose = require('mongoose');
const imghash = require('image-hash');
const Logo = require('../models/Logo'); // adjust path if needed
const path = require('path');

const uri = process.env.MONGODB_URI || 'your_mongo_uri_here';
const filepath = process.argv[2]; // e.g. node scripts/seed-logo.js "C:\...Amazon-Logo.png"
const name = process.argv[3] || 'brand';

if(!filepath){
  console.error('Usage: node scripts/seed-logo.js <filepath> [name]');
  process.exit(1);
}

mongoose.connect(uri, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=> {
    console.log('DB connected, hashing file', filepath);
    imghash.hash(filepath, 16, true, async (err, hash) => {
      if(err) { console.error(err); process.exit(1); }
      await Logo.findOneAndUpdate({ name }, { name, hash, meta:{original: path.basename(filepath)} }, { upsert:true });
      console.log('Seeded', name, 'hash=', hash);
      process.exit(0);
    });
  })
  .catch(err => { console.error(err); process.exit(1); });