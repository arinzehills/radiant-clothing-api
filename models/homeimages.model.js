const mongoose = require("mongoose");

const homeImageSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HomeImage", homeImageSchema);
