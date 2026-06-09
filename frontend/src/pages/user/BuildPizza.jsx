import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const STEPS = ["Base", "Sauce", "Cheese", "Veggies", "Review & Pay"];

export default function BuildPizza() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [inventory, setInventory] = useState({ base: [], sauce: [], cheese: [], veggie: [] });
  const [selected, setSelected] = useState({ base: null, sauce: null, cheese: null, veggies: [] });
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [bases, sauces, cheeses, veggies] = await Promise.all(
          ["base", "sauce", "cheese", "veggie"].map((c) => api.get(`/inventory/category/${c}`))
        );
        setInventory({
          base: bases.data,
          sauce: sauces.data,
          cheese: cheeses.data,
          veggie: veggies.data,
        });
      } catch {
        toast.error("Failed to load ingredients");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const totalPrice = () => {
    let total = 0;
    if (selected.base) total += selected.base.pricePerUnit;
    if (selected.sauce) total += selected.sauce.pricePerUnit;
    if (selected.cheese) total += selected.cheese.pricePerUnit;
    selected.veggies.forEach((v) => (total += v.pricePerUnit));
    return total;
  };

  const toggleVeggie = (item) => {
    setSelected((prev) => ({
      ...prev,
      veggies: prev.veggies.find((v) => v._id === item._id)
        ? prev.veggies.filter((v) => v._id !== item._id)
        : [...prev.veggies, item],
    }));
  };

  const handlePayment = async () => {
    if (!address.trim()) return toast.error("Please enter delivery address");
    try {
      const amount = totalPrice();
      const orderRes = await api.post("/payment/create-order", { amount });
      const { orderId, amount: razorAmount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorAmount,
        currency,
        name: "PizzaApp",
        description: "Custom Pizza Order",
        order_id: orderId,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await api.post("/payment/verify", response);
          if (verifyRes.data.verified) {
            // Place order
            await api.post("/orders", {
              pizza: {
                base: selected.base._id,
                sauce: selected.sauce._id,
                cheese: selected.cheese._id,
                veggies: selected.veggies.map((v) => v._id),
              },
              totalPrice: amount,
              deliveryAddress: address,
              payment: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                status: "paid",
                amount,
              },
            });
            toast.success("🎉 Order placed successfully!");
            navigate("/my-orders");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#e63946" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  const ItemCard = ({ item, selected: isSelected, onClick, multi }) => (
    <button
      onClick={onClick}
      className={`p-4 border-2 rounded-xl text-left transition ${
        isSelected ? "border-pizza-red bg-red-50" : "border-gray-200 hover:border-pizza-orange"
      }`}
    >
      <p className="font-semibold text-pizza-dark">{item.name}</p>
      <p className="text-pizza-red text-sm font-bold">+₹{item.pricePerUnit}</p>
      <p className="text-xs text-gray-400">{item.quantity} left</p>
    </button>
  );

  if (loading) return <div className="flex justify-center items-center h-screen">Loading ingredients...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Steps bar */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "bg-pizza-red text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <p className={`ml-1 text-xs hidden sm:block ${i === step ? "text-pizza-red font-semibold" : "text-gray-400"}`}>{s}</p>
              {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 ${i < step ? "bg-pizza-red" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          {/* Step 0: Base */}
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold text-pizza-dark mb-4">Choose Your Base</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inventory.base.map((item) => (
                  <ItemCard key={item._id} item={item} isSelected={selected.base?._id === item._id} onClick={() => setSelected({ ...selected, base: item })} />
                ))}
              </div>
              <button disabled={!selected.base} onClick={() => setStep(1)} className="mt-6 w-full bg-pizza-red text-white py-2 rounded-lg disabled:opacity-40">Next →</button>
            </>
          )}

          {/* Step 1: Sauce */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-pizza-dark mb-4">Choose Your Sauce</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inventory.sauce.map((item) => (
                  <ItemCard key={item._id} item={item} isSelected={selected.sauce?._id === item._id} onClick={() => setSelected({ ...selected, sauce: item })} />
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600">← Back</button>
                <button disabled={!selected.sauce} onClick={() => setStep(2)} className="flex-1 bg-pizza-red text-white py-2 rounded-lg disabled:opacity-40">Next →</button>
              </div>
            </>
          )}

          {/* Step 2: Cheese */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-pizza-dark mb-4">Select Cheese</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inventory.cheese.map((item) => (
                  <ItemCard key={item._id} item={item} isSelected={selected.cheese?._id === item._id} onClick={() => setSelected({ ...selected, cheese: item })} />
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600">← Back</button>
                <button disabled={!selected.cheese} onClick={() => setStep(3)} className="flex-1 bg-pizza-red text-white py-2 rounded-lg disabled:opacity-40">Next →</button>
              </div>
            </>
          )}

          {/* Step 3: Veggies */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-pizza-dark mb-1">Select Veggies</h2>
              <p className="text-gray-400 text-sm mb-4">Pick as many as you like!</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inventory.veggie.map((item) => (
                  <ItemCard key={item._id} item={item} isSelected={!!selected.veggies.find((v) => v._id === item._id)} onClick={() => toggleVeggie(item)} multi />
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600">← Back</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-pizza-red text-white py-2 rounded-lg">Review →</button>
              </div>
            </>
          )}

          {/* Step 4: Review & Pay */}
          {step === 4 && (
            <>
              <h2 className="text-xl font-bold text-pizza-dark mb-4">Your Pizza Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Base:</span><span className="font-medium">{selected.base?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sauce:</span><span className="font-medium">{selected.sauce?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cheese:</span><span className="font-medium">{selected.cheese?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Veggies:</span><span className="font-medium">{selected.veggies.length > 0 ? selected.veggies.map(v => v.name).join(", ") : "None"}</span></div>
              </div>
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span><span className="text-pizza-red">₹{totalPrice()}</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pizza-red"
                required
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600">← Back</button>
                <button onClick={handlePayment} className="flex-1 bg-pizza-red text-white py-2 rounded-lg font-semibold hover:bg-red-700">
                  Pay ₹{totalPrice()} →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
