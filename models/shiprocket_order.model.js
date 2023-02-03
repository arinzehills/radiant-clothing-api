const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
  {
      main_order_id:{ type: String, default: "" },
      order_id:{ type: String, default: "" },
      shipment_id:{ type: String, default: "" },
      payload:{ type: Object, },
      status:{ type: String, default: "" },
      // status_code:{ type: String, default: "" },
      // onboarding_completed_now: { type: String, default: "" },
      // awb_code: { type: String, default: "" },
      // courier_name: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShipRocketOrder", orderProductSchema);
