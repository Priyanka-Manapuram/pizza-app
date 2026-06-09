const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Pizza varieties (pre-built combos) - can be extended
router.get("/varieties", protect, (req, res) => {
  res.json([
    { name: "Margherita", description: "Classic tomato & mozzarella", price: 249, emoji: "🍕" },
    { name: "Pepperoni", description: "Loaded with pepperoni slices", price: 349, emoji: "🍕" },
    { name: "BBQ Chicken", description: "Smoky BBQ with grilled chicken", price: 399, emoji: "🍕" },
    { name: "Veggie Supreme", description: "Garden fresh veggies", price: 299, emoji: "🍕" },
    { name: "Four Cheese", description: "A celebration of cheeses", price: 449, emoji: "🍕" },
  ]);
});

module.exports = router;
