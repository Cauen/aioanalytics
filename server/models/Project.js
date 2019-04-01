const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for Tags
let Project = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    data: Schema.Types.Mixed,
    admins: [{
      type: Schema.Types.ObjectId,
      required: true,
      ref: "admin"
    }],
    funnels: [{
      name: {type: String, required: true},
      steps: [{
        name: String,
        properties: [{}]
      }]
    }],
    date: { type: Date, default: Date.now }
  },
  {
    collection: "project"
  }
);

module.exports = mongoose.model("Project", Project);
