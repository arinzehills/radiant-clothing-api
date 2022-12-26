const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");

// order api
router.post("/order", (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(20).toString("hex"),
    };
    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log("error encountered");
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
      }
      order.KEY_ID = process.env.KEY_ID;
      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// payment verify api
router.post("/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    if (razorpay_signature === expectedSign) {
      res.status(200).json({ message: "payment verfified successfully" });
    } else {
      res.status(400).json("Invalid signature sent");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
