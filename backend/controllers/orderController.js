const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const { checkAndAlertLowStock } = require("../utils/stockAlert");

// @POST /api/orders  - place order after payment
exports.createOrder = async (req, res) => {
  try {
    const { pizza, totalPrice, deliveryAddress, payment } = req.body;

    const order = await Order.create({
      user: req.user._id,
      pizza,
      totalPrice,
      deliveryAddress,
      payment,
      status: "order_received",
      statusHistory: [{ status: "order_received" }],
    });

    // Deduct stock
    const itemsToDeduct = [
      pizza.base,
      pizza.sauce,
      pizza.cheese,
      ...(pizza.veggies || []),
      ...(pizza.meats || []),
    ];
    for (const itemId of itemsToDeduct) {
      await Inventory.findByIdAndUpdate(itemId, { $inc: { quantity: -1 } });
    }

    // Check and alert low stock
    await checkAndAlertLowStock();

    const populated = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/my  - user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders  - admin: all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/status  - admin updates order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.statusHistory.push({ status, note });
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
