const User = require("../models/User");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

// @GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, pendingOrders, inventory] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $nin: ["delivered", "cancelled"] } }),
      Inventory.find(),
    ]);

    const lowStockItems = inventory.filter((i) => i.quantity <= i.threshold);
    const totalRevenue = await Order.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.json({
      totalUsers,
      totalOrders,
      pendingOrders,
      lowStockCount: lowStockItems.length,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStockItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
