const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  type:{type:String,required:true},
  provider:{type:String},
  input:{type:String},
  result:{type:Object},
  createdAt:{type:Date,default:Date.now}
});
module.exports = mongoose.model('Detection', schema);
