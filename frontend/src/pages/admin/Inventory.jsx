import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const CATEGORIES = ["base", "sauce", "cheese", "veggie", "meat"];
const CATEGORY_EMOJI = { base: "🫓", sauce: "🍅", cheese: "🧀", veggie: "🥬", meat: "🥩" };

const defaultForm = { category: "base", name: "", quantity: 100, threshold: 20, pricePerUnit: 50, unit: "units" };

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => api.get("/inventory").then((res) => { setItems(res.data); setLoading(false); });

  useEffect(() => { fetchItems(); }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

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
    setForm({ category: item.category, name: item.name, quantity: item.quantity, threshold: item.threshold, pricePerUnit: item.pricePerUnit, unit: item.unit });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/inventory/${id}`);
    setItems((prev) => prev.filter((i) => i._id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-pizza-dark">Inventory Management</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }} className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            + Add Item
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-sm ${filter === cat ? "bg-pizza-dark text-white" : "bg-white border text-gray-600 hover:border-pizza-red"}`}>
              {cat === "all" ? "All" : `${CATEGORY_EMOJI[cat]} ${cat}`}
            </button>
          ))}
        </div>

        {/* Items table */}
        {loading ? <p>Loading...</p> : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pizza-dark text-white">
                <tr>
                  {["Category", "Name", "Qty", "Threshold", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{CATEGORY_EMOJI[item.category]} {item.category}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className={`px-4 py-3 font-bold ${item.quantity <= item.threshold ? "text-red-600" : "text-green-600"}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.threshold}</td>
                    <td className="px-4 py-3">₹{item.pricePerUnit}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.isAvailable ? "Available" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold mb-4">{editId ? "Edit Item" : "Add New Item"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="border rounded-lg px-3 py-2" required />
                  <input type="number" placeholder="Threshold" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: +e.target.value })} className="border rounded-lg px-3 py-2" />
                </div>
                <input type="number" placeholder="Price per unit (₹)" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600">Cancel</button>
                  <button type="submit" className="flex-1 bg-pizza-red text-white py-2 rounded-lg">{editId ? "Update" : "Add"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
