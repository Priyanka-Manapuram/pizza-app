import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pizza-light">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-pizza-dark mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>
        {sent ? (
          <p className="text-green-600 font-medium">Check your email for the reset link!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pizza-red"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pizza-red text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-4 block text-center text-sm text-pizza-red hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
