import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Cookies from "js-cookie";
import { AuthContext } from "./AuthContext"; // ✅ context import

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 로그인 상태 복원
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) return;
    axiosInstance
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // 로그아웃
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    }
    Cookies.remove("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
