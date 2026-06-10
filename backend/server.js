const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { scheduleStockAlerts } = require("./utils/cronJobs");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pizza-app-eight-sable.vercel.app"
  ],
  credentials: true
}));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/pizza", require("./routes/pizzaRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// Schedule cron jobs (stock alerts)
scheduleStockAlerts();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
