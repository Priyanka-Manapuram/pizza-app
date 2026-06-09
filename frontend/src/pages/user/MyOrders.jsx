import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const STATUS_MAP = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  order_received: { label: "Order Received", color: "bg-blue-100 text-blue-700" },
  in_kitchen: { label: "In the Kitchen 👨‍🍳", color: "bg-yellow-100 text-yellow-700" },
  sent_to_delivery: { label: "Out for Delivery 🛵", color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Delivered ✅", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled ❌", color: "bg-red-100 text-red-600" },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      setOrders(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for status updates every 30s
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-pizza-dark mb-6">My Orders</h1>
        {loading ? (
          <p className="text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🍕</div>
            <p>No orders yet. Start building your pizza!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <div key={order._id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Base:</span> {order.pizza.base?.name}</p>
                    <p><span className="font-medium">Sauce:</span> {order.pizza.sauce?.name}</p>
                    <p><span className="font-medium">Cheese:</span> {order.pizza.cheese?.name}</p>
                    {order.pizza.veggies?.length > 0 && (
                      <p><span className="font-medium">Veggies:</span> {order.pizza.veggies.map(v => v.name).join(", ")}</p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center border-t pt-3">
                    <span className="font-bold text-pizza-red text-lg">₹{order.totalPrice}</span>
                    <span className="text-xs text-gray-400">{order.deliveryAddress}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
