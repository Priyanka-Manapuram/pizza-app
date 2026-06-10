import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = ["base", "sauce", "cheese", "veggie", "meat"];
const CATEGORY_EMOJI = { base: "🫓", sauce: "🍅", cheese: "🧀", veggie: "🥬", meat: "🥩" };
const CATEGORY_LABEL = { base: "Pizza Base", sauce: "Sauce", cheese: "Cheese", veggie: "Veggies", meat: "Meat" };

const defaultForm = { category: "base", name: "", quantity: 100, threshold: 20, pricePerUnit: 50, unit: "units" };

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showRestock, setShowRestock] = useState(null); // item being restocked
  const [restockQty, setRestockQty] = useState(50);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get("/inventory");
      setItems(res.data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  // Stats per category
  const categoryStats = CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    const lowStock = catItems.filter((i) => i.quantity <= i.threshold);
    const outOfStock = catItems.filter((i) => i.quantity === 0);
    return { cat, total: catItems.length, lowStock: lowStock.length, outOfStock: outOfStock.length };
  });

  const totalLowStock = items.filter((i) => i.quantity <= i.threshold).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await api.put(`/inventory/${editId}`, form);
        setItems((prev) => prev.map((i) => (i._id === editId ? res.data : i)));
        toast.success("Item updated!");
      } else {
        const res = await api.post("/inventory", form);
        setItems((prev) => [...prev, res.data]);
        toast.success("Item added!");
      }
      setShowForm(false);
      setForm(defaultForm);
      setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleEdit = (item) => {
    setForm({
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      threshold: item.threshold,
      pricePerUnit: item.pricePerUnit,
      unit: item.unit,
    });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleRestock = async () => {
    if (!showRestock) return;
    try {
      const newQty = showRestock.quantity + Number(restockQty);
      const res = await api.put(`/inventory/${showRestock._id}`, { quantity: newQty });
      setItems((prev) => prev.map((i) => (i._id === showRestock._id ? res.data : i)));
      toast.success(`Restocked ${showRestock.name} by ${restockQty} units!`);
      setShowRestock(null);
      setRestockQty(50);
    } catch {
      toast.error("Restock failed");
    }
  };

  const getStockColor = (item) => {
    if (item.quantity === 0) return "bg-red-500";
    if (item.quantity <= item.threshold) return "bg-orange-400";
    return "bg-green-500";
  };

  const getStockPercent = (item) => {
    const max = Math.max(item.quantity, item.threshold * 3, 100);
    return Math.min((item.quantity / max) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-pizza-dark">Inventory Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalLowStock > 0
                ? `⚠️ ${totalLowStock} item(s) below threshold`
                : "✅ All stock levels healthy"}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
            className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-medium"
          >
            + Add Item
          </button>
        </div>

        {/* Category summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {categoryStats.map(({ cat, total, lowStock, outOfStock }) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`bg-white rounded-xl p-4 text-left border-2 transition ${
                filter === cat ? "border-pizza-red shadow-md" : "border-transparent shadow hover:border-pizza-orange"
              }`}
            >
              <div className="text-2xl mb-1">{CATEGORY_EMOJI[cat]}</div>
              <p className="font-bold text-pizza-dark text-sm">{CATEGORY_LABEL[cat]}</p>
              <p className="text-xs text-gray-400">{total} items</p>
              {outOfStock > 0 && <p className="text-xs text-red-600 font-medium mt-1">🔴 {outOfStock} out of stock</p>}
              {outOfStock === 0 && lowStock > 0 && <p className="text-xs text-orange-500 font-medium mt-1">🟠 {lowStock} low stock</p>}
              {outOfStock === 0 && lowStock === 0 && <p className="text-xs text-green-600 font-medium mt-1">🟢 All good</p>}
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filter === cat ? "bg-pizza-dark text-white" : "bg-white border text-gray-600 hover:border-pizza-red"
              }`}
            >
              {cat === "all" ? `All (${items.length})` : `${CATEGORY_EMOJI[cat]} ${CATEGORY_LABEL[cat]} (${items.filter(i => i.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Inventory table */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading inventory...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">{CATEGORY_EMOJI[filter] || "📦"}</div>
            <p>No items found. Add one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pizza-dark text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Stock Level</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Threshold</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className={`border-t hover:bg-gray-50 ${item.quantity <= item.threshold ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3 text-gray-500">
                      {CATEGORY_EMOJI[item.category]} {CATEGORY_LABEL[item.category]}
                    </td>
                    <td className="px-4 py-3 font-semibold text-pizza-dark">{item.name}</td>
                    <td className="px-4 py-3 w-36">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getStockColor(item)}`}
                          style={{ width: `${getStockPercent(item)}%` }}
                        />
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-bold ${item.quantity === 0 ? "text-red-600" : item.quantity <= item.threshold ? "text-orange-500" : "text-green-600"}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{item.threshold}</td>
                    <td className="px-4 py-3 text-gray-700">₹{item.pricePerUnit}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.quantity === 0
                          ? "bg-red-100 text-red-700"
                          : item.quantity <= item.threshold
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {item.quantity === 0 ? "Out of Stock" : item.quantity <= item.threshold ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowRestock(item); setRestockQty(50); }}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 font-medium"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-bold text-pizza-dark mb-4">
                {editId ? "✏️ Edit Item" : "➕ Add New Item"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Name</label>
                  <input
                    placeholder="e.g. Thin Crust, Mozzarella..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                    <input
                      type="number" min="0"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Low Stock Threshold</label>
                    <input
                      type="number" min="1"
                      value={form.threshold}
                      onChange={(e) => setForm({ ...form, threshold: +e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price per unit (₹)</label>
                  <input
                    type="number" min="0"
                    value={form.pricePerUnit}
                    onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditId(null); }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-pizza-red text-white py-2 rounded-lg hover:bg-red-700 font-medium">
                    {editId ? "Update" : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {showRestock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-lg font-bold text-pizza-dark mb-1">📦 Restock Item</h2>
              <p className="text-gray-500 text-sm mb-4">
                <span className="font-medium text-pizza-dark">{showRestock.name}</span> — Current stock: <span className="font-bold text-orange-500">{showRestock.quantity}</span>
              </p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Units to add</label>
                <input
                  type="number" min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2 text-center">
                New stock will be: <span className="font-bold text-green-600">{showRestock.quantity + Number(restockQty)}</span>
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowRestock(null)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                >
                  ✅ Confirm Restock
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}