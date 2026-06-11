const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Inventory = require("./models/Inventory");
const User = require("./models/User");

const seedData = [
  // Bases
  { category: "base", name: "Thin Crust", quantity: 100, pricePerUnit: 50 },
  { category: "base", name: "Thick Crust", quantity: 100, pricePerUnit: 60 },
  { category: "base", name: "Cheese Burst", quantity: 80, pricePerUnit: 80 },
  { category: "base", name: "Whole Wheat", quantity: 90, pricePerUnit: 70 },
  { category: "base", name: "Gluten Free", quantity: 50, pricePerUnit: 100 },
  // Sauces
  { category: "sauce", name: "Tomato Marinara", quantity: 100, pricePerUnit: 30 },
  { category: "sauce", name: "Pesto", quantity: 80, pricePerUnit: 40 },
  { category: "sauce", name: "BBQ", quantity: 90, pricePerUnit: 35 },
  { category: "sauce", name: "Alfredo", quantity: 70, pricePerUnit: 45 },
  { category: "sauce", name: "Marinara", quantity: 60, pricePerUnit: 40 },
  // Cheeses
  { category: "cheese", name: "Mozzarella", quantity: 100, pricePerUnit: 60 },
  { category: "cheese", name: "Cheddar", quantity: 80, pricePerUnit: 55 },
  { category: "cheese", name: "Parmesan", quantity: 70, pricePerUnit: 70 },
  { category: "cheese", name: "Vegan Cheese", quantity: 50, pricePerUnit: 90 },
  // Veggies
  { category: "veggie", name: "Bell Peppers", quantity: 150, pricePerUnit: 20 },
  { category: "veggie", name: "Mushrooms", quantity: 120, pricePerUnit: 25 },
  { category: "veggie", name: "Onions", quantity: 200, pricePerUnit: 15 },
  { category: "veggie", name: "Olives", quantity: 100, pricePerUnit: 30 },
  { category: "veggie", name: "Spinach", quantity: 80, pricePerUnit: 20 },
  { category: "veggie", name: "Corn", quantity: 150, pricePerUnit: 20 },
  { category: "veggie", name: "Jalapeños", quantity: 100, pricePerUnit: 25 },
  { category: "veggie", name: "Tomatoes", quantity: 180, pricePerUnit: 15 },
  // Meats
  { category: "meat", name: "Pepperoni", quantity: 100, pricePerUnit: 80 },
  { category: "meat", name: "Chicken", quantity: 90, pricePerUnit: 90 },
  { category: "meat", name: "Sausage", quantity: 80, pricePerUnit: 85 },
  { category: "meat", name: "Bacon", quantity: 70, pricePerUnit: 95 },
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Inventory.deleteMany();
  await Inventory.insertMany(seedData);

  // Create admin user
  const adminExists = await User.findOne({ email: "admin@pizzaapp.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@pizzaapp.com",
      password: "Admin@123",
      role: "admin",
      isEmailVerified: true,
    });
    console.log("Admin created: admin@pizzaapp.com / Admin@123");
  }

  console.log("Database seeded!");
  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
