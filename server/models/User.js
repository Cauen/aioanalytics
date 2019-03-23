const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Define collection and schema for User
let User = new Schema(
  {
    identification: {
      type: String,
      lowercase: true,
      unique: true,
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address"
      ]
    },
    initial_referer: {
      type: String
    },
    initial_page: {
      type: String
    },
    name: {
      type: String
    },
    number: {
      type: String
    },
    ip: {
      type: String
    },
    device_id: {
      type: String
    },
    session_id: {
      type: String
    },
    custom_data: Schema.Types.Mixed,
    revenue: {
      type: Number,
      default: 0
    },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    messages: [{}],
    updated: { type: Date, default: Date.now }
  },
  {
    collection: "user"
  }
);

module.exports = mongoose.model("User", User);
