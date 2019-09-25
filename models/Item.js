const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  review: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

let Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
