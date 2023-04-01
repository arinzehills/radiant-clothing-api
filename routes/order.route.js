const router = require("express").Router();
const Order = require("../models/Order.model");
const paymentFunc = require("../controllers/payment.controller");
const auth = require("../middleware/auth");

router.post("/getUserOrderDetails", auth, async (req, res) => {
  const order = await Order.find({ order_id: req.body.order_id });
  const trackShipment = await paymentFunc.trackShipment({
    shipment_id: order[0].shipment_id,
  });

  res.status(200).json({ order: order[0], track_shipment: trackShipment });
});
router.post("/returnOrder", auth, async (req, res) => {
  try {
    var order = await paymentFunc.returnOrder(req.body.order);
    order.order_status = order.status;
    findedOrder = await Order.findByIdAndUpdate(req.body.order._id, order, {
      useFindAndModify: false,
    });
    console.log("findedOrder");
    console.log(findedOrder);
    res
      .status(200)
      .json({ success: true, message: "order placed successfully", order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});
module.exports = router;
