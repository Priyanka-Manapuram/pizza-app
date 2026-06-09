const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["base", "sauce", "cheese", "veggie", "meat"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 100 },
    threshold: { type: Number, default: 20 },
    unit: { type: String, default: "units" },
    pricePerUnit: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-set isAvailable based on quantity
inventorySchema.pre("save", function (next) {
  this.isAvailable = this.quantity > 0;
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
