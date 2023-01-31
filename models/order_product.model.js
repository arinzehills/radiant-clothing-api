const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
  {
      order_id:{ type: String, default: "" },
    // product_name: { type: String, default: "" },
    billing_address: { type: Object, default: "" },
    totalAmount: { type: String, default: "" },
    products: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderProduct", orderProductSchema);
