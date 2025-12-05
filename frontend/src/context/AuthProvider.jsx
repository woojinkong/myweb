// AuthProvider.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Cookies from "js-cookie";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();


  useEffect(() => {
    // 1) accessToken이 없으면 유저 정보 불러올 필요 없음
    const token = Cookies.get("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 3) axiosInstance 준비될 시간을 위해 살짝 지연
    const timer = setTimeout(() => {
      fetchUser();
    }, 200); // 200~300ms 추천

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.warn("유저 불러오기 실패:", err);

      // ❗ 중요: refresh 실패 시에만 토큰 제거
      if (err.response?.status === 403 || err.response?.status === 401) {
        //Cookies.remove("accessToken");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      //
    }

    Cookies.remove("accessToken");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setUser(null);
  };

  if (loading) return <p>⏳ 로그인 상태 확인 중...</p>;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
