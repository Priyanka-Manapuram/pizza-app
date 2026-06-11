import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifEmail, setNotifEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "👤",
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "bg-green-50 border-green-200",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      label: "Revenue (Paid)",
      value: `₹${stats.totalRevenue}`,
      icon: "💰",
      color: "bg-purple-50 border-purple-200",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockCount,
      icon: "⚠️",
      color: "bg-red-50 border-red-200",
    },
  ];

  const saveNotifEmail = async () => {
    setSavingEmail(true);
    try {
      await api.put("/admin/notification-email", {
        notificationEmail: notifEmail,
      });
      toast.success("Notification email saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-pizza-dark mb-6">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((c) => (
            <div
              key={c.label}
              className={`bg-white border rounded-xl p-4 ${c.color}`}
            >
              <div className="text-3xl mb-1">{c.icon}</div>
              <p className="text-2xl font-bold text-pizza-dark">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>

        {stats.lowStockItems?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h2 className="font-bold text-red-700 mb-3">⚠️ Low Stock Alerts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stats.lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg px-3 py-2 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600 ml-2">
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="font-bold text-pizza-dark mb-1">
            📧 Stock Alert Email
          </h2>
          <p className="text-gray-400 text-sm mb-3">
            You will receive low stock alerts on this email when any item goes
            below threshold.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="admin@example.com"
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red text-sm"
            />
            <button
              onClick={saveNotifEmail}
              disabled={savingEmail || !notifEmail}
              className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-40"
            >
              {savingEmail ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
