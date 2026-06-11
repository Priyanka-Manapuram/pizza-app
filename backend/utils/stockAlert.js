const Inventory = require("../models/Inventory");
const User = require("../models/User");
const { sendEmail } = require("./sendEmail");

exports.checkAndAlertLowStock = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$threshold"] },
    });

    if (lowStockItems.length === 0) return;

    // Get admin email from DB
    const admin = await User.findOne({ role: "admin" });
    const adminEmail = admin?.notificationEmail || admin?.email || process.env.ADMIN_EMAIL;

    const itemList = lowStockItems
      .map((i) => `<li><b>${i.name}</b> (${i.category}): ${i.quantity} units remaining</li>`)
      .join("");

    await sendEmail({
      to: adminEmail,
      subject: "⚠️ PizzaApp Low Stock Alert",
      html: `
        <h2>Low Stock Warning</h2>
        <p>The following items are at or below threshold:</p>
        <ul>${itemList}</ul>
        <p>Please restock soon to avoid order disruptions.</p>
      `,
    });

    console.log(`Low stock alert sent to ${adminEmail}`);
  } catch (err) {
    console.error("Stock alert error:", err.message);
  }
};