const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order.model");
const OrderProduct = require("../models/order_product.model");
const User = require("../models/user.model");

function isToday(date) {
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    return true;
  }
  return false;
}

// order api
router.post("/order", (req, res) => {
  console.log(req.body.amount)
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

// get orders
router.post("/orders", async (req, res) => {
  const analytics = {};
  let totalRevenue = 0;
  let recentOrders = [];
  let totalSalesToday = 0;

  try {
    const orders = await Order.find();
    var users = await User.find({ user_type: "business_user" }).lean();

    // get the total sales
    orders.forEach((order) => (totalRevenue += order.amount));

    // get 5 recent orders
    recentOrders = orders.filter((_, idx) => idx < 5);

    // get total orders today.
    let todayTransactions = orders.filter((order) => isToday(order.createdAt));
    todayTransactions.forEach((item) => {
      totalSalesToday += item.amount;
    });
    // append the populated variable to analytics object
    analytics.totalRevenue = totalRevenue;
    analytics.recentOrders = recentOrders;
    analytics.totalOrdersToday = todayTransactions.length;
    analytics.totalSalesToday = totalSalesToday;
    console.log(totalSalesToday);

    res.status(200).json({ users: users.length, orders, analytics });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

// payment verify api
router.post("/verify", async (req, res) => {
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    if (razorpay_signature === expectedSign) {
      const order = Order({
        isPaid: true,
        user_id:req.body.user_id,
        amount: req.body.amount,
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      });
      const newOrder = await order.save();
      // console.log(newOrder);
      const newOrderProduct= new OrderProduct({
        order_id: razorpay_order_id,
        totalAmount: req.body.amount,
        products:req.body.products,
        billing_address:req.body.billing_address
      });
      const orderProduct = await newOrderProduct.save();
  console.log('req.orderproduct')
  console.log(orderProduct)
      res.status(200).json({ message: "payment verfified successfully",orderProduct });
    } else {
      const order = Order({
        isPaid: false,
        amount: req.body.amount,
        user_id:req.body.user_id,
        razorpay: {
          orderId: razorpay_order_id || null,
          paymentId: razorpay_payment_id || null,
          signature: razorpay_signature || null,
        },
      });
      const newOrder = await order.save();
      console.log(newOrder);
      res.status(400).json("Invalid signature sent");
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something went wrong" });
  }
});
router.post("/add_billing_address", async (req, res) => {
  // await User.findByIdAndUpdate(req.user.user_id, req.body, {
  //   useFindAndModify: false,
  // });
  try {
    var user = await User.findById(req.body.user_id);
    await user.updateOne({
      $push: { billing_address: req.body.billing_address },
    });
    res.status(200).json({ message: "Added Successfully", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
router.post("/getBillingAddress", async (req, res) => {
  try {
    var user = await User.findById(req.body.user_id);
    console.log(user.billing_address);
    console.log("req.body");

    res.status(200).json({
      billing_address: user.billing_address,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
router.post("/deleteBillingAddress", async (req, res) => {
  try {
    var user = await User.findById(req.body.user_id);
    const billing_address=user.billing_address
    console.log(user.billing_address);
    console.log('billing address is hitted  ');
    for(addr of billing_address){
      if(addr.id===req.body.address_id){
        await user.updateOne({
          $pull: { billing_address: addr },
        });
      }
    }
    console.log("req.body");

    res.status(200).json({
      success:true,
      billing_address: user.billing_address,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;
