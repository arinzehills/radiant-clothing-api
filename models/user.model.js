const mongoose = require("mongoose");

module.exports = USER_TYPES = {
  NORMALUSER: "normal_user",
  SUPPORT: "support",
  ADMIN: "admin",
};
const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, default: "" },
    email: { type: String, unique: true },
    password: { type: String },
    phone: { type: String },
    address: { type: String },
    billing_address: { type: Array, default: [] },
    profilePicture: { type: String, default: "" },
    user_type: { type: String, default: "business_user" }, //or admin
    token: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
