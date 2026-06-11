import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-pizza-dark text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="text-xl font-bold flex items-center gap-2">
        🍕 PizzaSlice
      </Link>
      <div className="flex items-center gap-4">
        {user?.role === "user" && (
          <>
            <Link to="/dashboard" className="hover:text-pizza-orange transition text-sm">Menu</Link>
            <Link to="/build-pizza" className="hover:text-pizza-orange transition text-sm">Build Pizza</Link>
            <Link to="/my-orders" className="hover:text-pizza-orange transition text-sm">My Orders</Link>
          </>
        )}
        {user?.role === "admin" && (
          <>
            <Link to="/admin" className="hover:text-pizza-orange transition text-sm">Dashboard</Link>
            <Link to="/admin/orders" className="hover:text-pizza-orange transition text-sm">Orders</Link>
            <Link to="/admin/inventory" className="hover:text-pizza-orange transition text-sm">Inventory</Link>
          </>
        )}
        <span className="text-sm text-pizza-orange font-medium">{user?.name}</span>
        <button onClick={handleLogout} className="bg-pizza-red px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition">
          Logout
        </button>
      </div>
    </nav>
  );
}
