const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, default: "" },
    super_category: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: String, default: "" },
    discount_price: { type: String, default: "" },
    gst: { type: String, default: "" },
    description: { type: String },
    quantity: { type: String },
    length: { type: String },
    breadth: { type: String },
    height: { type: String },
    weight: { type: String },
    reviews: { type: Array, default: [] },
    images: { type: Array, default: [] },
    sizes: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
