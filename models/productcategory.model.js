const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    admin_id: {
      type: String,
      default: "",
      // required: true
    },
    category: { type: String, max: 200, unique: true },
    description: { type: String, max: 700 },
    image: { type: String },
    // comments: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductCategory", productCategorySchema);
