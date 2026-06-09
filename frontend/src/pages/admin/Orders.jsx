import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUSES = ["order_received", "in_kitchen", "sent_to_delivery", "delivered", "cancelled"];
const STATUS_LABELS = {
  order_received: "Order Received",
  in_kitchen: "In Kitchen",
  sent_to_delivery: "Sent to Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then((res) => { setOrders(res.data); setLoading(false); });
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const statusColor = {
    order_received: "text-blue-600",
    in_kitchen: "text-yellow-600",
    sent_to_delivery: "text-orange-600",
    delivered: "text-green-600",
    cancelled: "text-red-600",
    pending: "text-gray-500",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-pizza-dark mb-6">Manage Orders</h1>
        {loading ? <p>Loading...</p> : orders.length === 0 ? (
          <p className="text-gray-400">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-pizza-dark">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{order.user?.name} ({order.user?.email})</p>
                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${statusColor[order.status]}`}>{STATUS_LABELS[order.status] || order.status}</p>
                    <p className="font-bold text-pizza-red">₹{order.totalPrice}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>🍕 {order.pizza.base?.name} + {order.pizza.sauce?.name} + {order.pizza.cheese?.name}</p>
                  {order.pizza.veggies?.length > 0 && <p>🥬 {order.pizza.veggies.map(v => v.name).join(", ")}</p>}
                  <p className="text-gray-400 mt-1">📍 {order.deliveryAddress}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order._id, s)}
                      disabled={order.status === s}
                      className={`text-xs px-3 py-1 rounded-full border transition ${
                        order.status === s
                          ? "bg-pizza-dark text-white border-pizza-dark"
                          : "border-gray-300 text-gray-600 hover:border-pizza-red hover:text-pizza-red"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
