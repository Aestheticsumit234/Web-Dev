import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  // 1. Lazy initialization: Page load hote hi directly localStorage se data lo
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  // 2. Agar user object hai, toh default 'true' hoga, warna 'false'
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);

  // 3. Loading default false kardo kyunki ab delay nahi hai
  const [loading, setLoading] = useState(false);

  // (Ab yahan woh useEffect likhne ki zarurat hi nahi hai, humne delete kar diya!)

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const getProfile = (updatedData) => {
    const newData = { ...user, ...updatedData };
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include", // Backend se cookie clear karne ke liye
      });
    } catch (error) {
      console.error("Error logging out from server:", error);
    } finally {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      // window.location.href ki jagah tum navigate() bhi use kar sakte ho agar protected route use kar rahe ho, par ye bhi thik hai.
      window.location.href = "/login";
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
