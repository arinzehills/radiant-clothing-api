const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    isPaid: Boolean,
    user_id:String,
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

