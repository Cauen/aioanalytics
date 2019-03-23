const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Tags
let Tags = new Schema({
  name: {
    type: String,
    required: true
  },
  created: { type: Date, default: Date.now },
},{
    collection: 'tags'
});

module.exports = mongoose.model('Tags', Course);