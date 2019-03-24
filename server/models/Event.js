const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Tags
let Event = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    data: Schema.Types.Mixed,
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    imported: {
      type: String
    },
    comments: [
      {
        created: { type: Date, default: Date.now },
        content: { type: String },
        owner: { type: Schema.Types.ObjectId, ref: "admin" }
      }
    ],
    date: { type: Date, default: Date.now }
  },
  {
    collection: "event"
  }
);

module.exports = mongoose.model("Event", Event);
