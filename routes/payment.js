const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order.model");
const User = require("../models/user.model");
const auth = require("../middleware/auth");
const { default: fetch } = require("node-fetch");
const moment = require("moment/moment");
const paymentFunc = require("../controllers/payment.controller");
const shortid = require("shortid");

function isToday(date) {
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    return true;
  }
  return false;
}

// order api
router.post("/order", (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });
    const options = {
      amount: req.body.amount.toFixed(0) * 100,
      currency: "INR",
      receipt: crypto.randomBytes(20).toString("hex"),
    };
    instance.orders.create(options, async (error, order) => {
      if (error) {
        console.log("error encountered");
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
      }
      order.KEY_ID = process.env.KEY_ID;
      console.log("order");
      console.log(process.env.KEY_ID);

      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// payment verify api
router.post("/without-verify", async (req, res) => {
  console.log("req.body vrs");
  console.log(req.body);
  console.log(req.body.shipping_charges);
  try {
    var order = await paymentFunc.createOrder({ ...req.body, cod: 1 });
    res
      .status(200)
      .json({ success: true, message: "order placed successfully", order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});
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
      var order = await paymentFunc.createOrder({ ...req.body, cod: 0 });
      console.log(order);
      res.status(200).json({
        success: true,
        message: "payment verified successfully",
        order,
      });
    } else {
      const order = Order({
        isPaid: false,
        amount: req.body.amount,
        user_id: req.body.user_id,
        sub_total: req.body.sub_total,
        razorpay: {
          orderId: razorpay_order_id || null,
          paymentId: razorpay_payment_id || null,
          signature: razorpay_signature || null,
        },
      });
      const newOrder = await order.save();
      console.log(newOrder);
      res
        .status(400)
        .json({ success: false, message: "Invalid signature sent" });
    }
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

    res
      .status(200)
      .json({ users: users.length, orders: orders.reverse(), analytics });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

router.post("/getUserOrders", auth, async (req, res) => {
  console.log(req.user);
  const orders = await Order.find({ user_id: req.user.user_id });
  console.log(orders);
  res.status(200).json(orders.reverse());
});

router.post("/getServiceability", async (req, res) => {
  const { token } = await paymentFunc.authShiprocket();
  if (!req.body.billing_address) {
    return;
  }
  let total_weight = 0;
  let quantity = 0;
  for (product of req.body.products) {
    total_weight += total_weight + eval(product.weight);
    quantity += quantity + eval(product.quantityToBuy);
    // product.quantityToBuy;
  }
  var response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?
 &weight=${total_weight * quantity}&delivery_country=${"IN"}&pickup_postcode=` +
      110078 +
      "&delivery_postcode=" +
      req.body.billing_address.postalCode +
      "&cod=" +
      req.body.cod,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await response.json();

  if (json.status != 200) {
    return res.status(200).json(json);
  }
  var lowestCharge = paymentFunc.getLowestFreightCharge(
    json.data.available_courier_companies
  );

  res.status(200).json({ status: json.status, lowest_charge: lowestCharge });
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
    res.status(200).json({
      billing_address: user?.billing_address.reverse(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/editBillingAddress", async (req, res) => {
  console.log("edit it s hitted");
  try {
    var user = await User.findById(req.body.user_id);
    const billing_address = user.billing_address;
    for (let addr of billing_address) {
      if (addr.id === req.body.address_id) {
        await user.updateOne({
          $pull: { billing_address: addr },
        });
        await user.updateOne({
          $push: { billing_address: req.body.billing_address },
        });
      }
    }

    res.status(200).json({
      success: true,
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
    const billing_address = user.billing_address;
    for (addr of billing_address) {
      if (addr.id === req.body.address_id) {
        await user.updateOne({
          $pull: { billing_address: addr },
        });
      }
    }

    res.status(200).json({
      success: true,
      billing_address: user.billing_address,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;
