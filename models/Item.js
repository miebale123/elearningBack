const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imgPath: { type: String},
  animaton: {type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Item = mongoose.model("items", itemSchema);

module.exports = Item;