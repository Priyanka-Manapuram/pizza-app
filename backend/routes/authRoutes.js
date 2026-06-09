const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, forgotPassword, resetPassword, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
const User = require("../models/User");

router.get("/verify-dev/:email", async (req, res) => {
  const user = await User.findOneAndUpdate(
    { email: req.params.email },
    { isEmailVerified: true },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: `${user.email} verified!` });
});

module.exports = router;

