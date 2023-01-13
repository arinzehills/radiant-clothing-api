const mongoose = require("mongoose");

const gstSchema = new mongoose.Schema(
  {
    gst: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gst", gstSchema);
