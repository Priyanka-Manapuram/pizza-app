const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllUsers } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/notification-email", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationEmail: req.body.notificationEmail },
      { new: true }
    );
    res.json({ message: "Notification email updated!", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
