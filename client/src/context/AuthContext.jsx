import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      navigate("/"); // ✅ redirect after login
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await API.post("/auth/register", { name, email, password });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      navigate("/"); // ✅ redirect after register
    } catch (err) {
      alert(err.response?.data?.msg || "Register failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login"); // ✅ redirect to login after logout
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
