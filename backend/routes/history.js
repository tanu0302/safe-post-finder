const express = require('express');
const Detection = require('../models/DetectionLog');
const router = express.Router();

router.get('/', async (req,res) => {
  const items = await Detection.find({}).sort({createdAt:-1}).limit(100);
  res.json({ ok:true, items });
});

router.post('/save', async (req,res) => {
  const doc = await Detection.create(req.body);
  res.json({ ok:true, doc });
});

module.exports = router;
