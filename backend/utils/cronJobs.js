const cron = require("node-cron");
const { checkAndAlertLowStock } = require("./stockAlert");

exports.scheduleStockAlerts = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running scheduled stock check...");
    await checkAndAlertLowStock();
  });

  console.log("Stock alert cron job scheduled (daily at 8 AM).");
};
