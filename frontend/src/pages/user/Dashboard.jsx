import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { Link } from "react-router-dom";

const VARIETIES = [
  { name: "Margherita", desc: "Classic tomato & mozzarella", price: 249, emoji: "🍕" },
  { name: "Pepperoni", desc: "Loaded with pepperoni slices", price: 349, emoji: "🍕" },
  { name: "BBQ Chicken", desc: "Smoky BBQ with grilled chicken", price: 399, emoji: "🍕" },
  { name: "Veggie Supreme", desc: "Garden fresh veggies", price: 299, emoji: "🥗" },
  { name: "Four Cheese", desc: "A celebration of cheeses", price: 449, emoji: "🧀" },
];

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-pizza-dark mb-2">Our Pizza Menu 🍕</h1>
        <p className="text-gray-500 mb-8">Choose from our classics or build your own!</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {VARIETIES.map((pizza) => (
            <div key={pizza.name} className="bg-white rounded-2xl shadow hover:shadow-md transition p-6">
              <div className="text-5xl mb-3">{pizza.emoji}</div>
              <h3 className="text-lg font-bold text-pizza-dark">{pizza.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{pizza.desc}</p>
              <p className="text-pizza-red font-bold text-xl">₹{pizza.price}</p>
            </div>
          ))}
        </div>

        <div className="bg-pizza-red rounded-2xl text-white p-8 text-center">
          <div className="text-4xl mb-3">🛠️</div>
          <h2 className="text-2xl font-bold mb-2">Build Your Own Pizza</h2>
          <p className="mb-4 opacity-90">Choose your base, sauce, cheese, and toppings!</p>
          <Link
            to="/build-pizza"
            className="bg-white text-pizza-red font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition inline-block"
          >
            Start Building →
          </Link>
        </div>
      </div>
    </div>
  );
}
