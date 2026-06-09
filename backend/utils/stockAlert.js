const Inventory = require("../models/Inventory");
const { sendEmail } = require("./sendEmail");

exports.checkAndAlertLowStock = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$threshold"] },
      isAvailable: true,
    });

    if (lowStockItems.length === 0) return;

    const itemList = lowStockItems
      .map((i) => `<li><b>${i.name}</b> (${i.category}): ${i.quantity} ${i.unit} remaining</li>`)
      .join("");

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "⚠️ PizzaApp Low Stock Alert",
      html: `
        <h2>Low Stock Warning</h2>
        <p>The following items are at or below threshold:</p>
        <ul>${itemList}</ul>
        <p>Please restock soon to avoid order disruptions.</p>
      `,
    });

    console.log(`Low stock alert sent for ${lowStockItems.length} items.`);
  } catch (err) {
    console.error("Stock alert error:", err.message);
  }
};
