const express = require("express");
const router = express.Router();
const { getInventory, getByCategory, createItem, updateItem, deleteItem } = require("../controllers/inventoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getInventory);
router.get("/category/:cat", protect, getByCategory);
router.post("/", protect, adminOnly, createItem);
router.put("/:id", protect, adminOnly, updateItem);
router.delete("/:id", protect, adminOnly, deleteItem);

module.exports = router;
