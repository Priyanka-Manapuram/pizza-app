const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pizza: {
      base: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
      sauce: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
      cheese: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
      veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }],
      meats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }],
    },
    presetName: { type: String, default: "" },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "order_received", "in_kitchen", "sent_to_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      amount: Number,
    },
    deliveryAddress: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);