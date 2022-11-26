const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: String, default: "" },
    description: { type: String },
    quantity: { type: String },
    images: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
