const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storesSchema = new Schema({
  merchantID: {
    type: String,
    required: true,
    maxlength: 255, // Limit the length of storeName
  },
  storeName: {
    type: String,
    required: true,
    maxlength: 100, // Limit the length of storeName
  },
  location: {
    type: String,
    required: true,
    maxlength: 150, // Limit the length of storeName
  },
  storeItem: {
    type: Array,
  },
  description: {
    type: String,
  },
  reviews: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Store", storesSchema);
