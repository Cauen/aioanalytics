const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Tags
let Event = new Schema({
    name: {
        type: String,
        required: true
    },
    data: Schema.Types.Mixed,
    user: { 
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user' 
    },
    comments: [{}],
    date: { type: Date, default: Date.now },
}, {
        collection: 'event'
    });

module.exports = mongoose.model('Event', Event);