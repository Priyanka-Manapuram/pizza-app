import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

const VARIETIES = [
  { name: "Margherita", desc: "Classic tomato & mozzarella", price: 249, emoji: "🍕" },
  { name: "Pepperoni", desc: "Loaded with pepperoni slices", price: 349, emoji: "🍕" },
  { name: "BBQ Chicken", desc: "Smoky BBQ with grilled chicken", price: 399, emoji: "🍕" },
  { name: "Veggie Supreme", desc: "Garden fresh veggies", price: 299, emoji: "🥗" },
  { name: "Four Cheese", desc: "A celebration of cheeses", price: 449, emoji: "🧀" },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(null);

  const handleDirectOrder = async (pizza) => {
    setOrdering(pizza.name);
    try {
      const orderRes = await api.post("/payment/create-order", { amount: pizza.price });
      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "PizzaApp",
        description: `${pizza.name} Pizza`,
        order_id: orderId,
        handler: async (response) => {
          const verifyRes = await api.post("/payment/verify", response);
          if (verifyRes.data.verified) {
            toast.success(`🎉 ${pizza.name} order placed!`);
            navigate("/my-orders");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#e63946" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment failed. Try again.");
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Build Your Own Pizza - with video background */}
        <div className="relative rounded-2xl overflow-hidden mb-10 h-56 sm:h-64">
          {/* Video background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="pizza.mp4"
              type="video/mp4"
            />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/55" />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <div className="text-4xl mb-2">🛠️</div>
            <h2 className="text-2xl font-bold mb-2">Build Your Own Pizza</h2>
            <p className="mb-4 opacity-90 text-sm">Choose your base, sauce, cheese, and toppings!</p>
            <Link
              to="/build-pizza"
              className="bg-white text-pizza-red font-bold px-8 py-2 rounded-full hover:bg-gray-100 transition text-sm"
            >
              Start Building →
            </Link>
          </div>
        </div>

        {/* Pizza Menu */}
        <h1 className="text-3xl font-bold text-pizza-dark mb-2">Our Pizza Menu 🍕</h1>
        <p className="text-gray-500 mb-6">Order directly or build your own!</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VARIETIES.map((pizza) => (
            <div
              key={pizza.name}
              className="bg-white rounded-2xl shadow hover:shadow-md transition p-6 flex flex-col"
            >
              <div className="text-5xl mb-3">{pizza.emoji}</div>
              <h3 className="text-lg font-bold text-pizza-dark">{pizza.name}</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">{pizza.desc}</p>
              <div className="flex justify-between items-center">
                <p className="text-pizza-red font-bold text-xl">₹{pizza.price}</p>
                <button
                  onClick={() => handleDirectOrder(pizza)}
                  disabled={ordering === pizza.name}
                  className="bg-pizza-red text-white text-sm px-4 py-2 rounded-full hover:bg-red-700 transition disabled:opacity-50"
                >
                  {ordering === pizza.name ? "Loading..." : "Order →"}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}