const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    isPaid: Boolean,
    amount: Number,
    razorpay: {
      paymentId: String,
      orderId: String,
      signature: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
