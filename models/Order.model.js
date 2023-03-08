const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    isPaid: Boolean,
    order_id: { type: String, default: "" },
    user_id: String,
    amount: Number,
    sub_total: Number,
    shipment_id: String,
    shiprocket_orderid: String,
    billing_address: { type: Object, default: "" },
    products: { type: Array, default: [] },
    razorpay: {
      paymentId: String,
      orderId: String,
      signature: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
