import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        // Only logout on 401 (invalid token), NOT on network errors
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          // Network error / backend sleeping - keep token, retry
          try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
          } catch {
            // Still failing - keep token but don't log out
            // User stays logged in, they can refresh again
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);