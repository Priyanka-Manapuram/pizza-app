const Inventory = require("../models/Inventory");

// @GET /api/inventory  (admin: all, user: only available)
exports.getInventory = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { isAvailable: true };
    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/inventory/category/:cat
exports.getByCategory = async (req, res) => {
  try {
    const items = await Inventory.find({ category: req.params.cat, isAvailable: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/inventory  (admin)
exports.createItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @PUT /api/inventory/:id  (admin)
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @DELETE /api/inventory/:id  (admin)
exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
